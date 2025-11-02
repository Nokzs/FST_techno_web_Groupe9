import { Injectable, Logger } from "@nestjs/common";
import ISO6391 from "iso-639-1";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rawTranslateModule = require("@vitalets/google-translate-api");

type TranslateResponse = {
  text: string;
  from?: { language?: { iso?: string } };
};

type TranslateFunction = (
  text: string,
  options: Record<string, unknown>,
) => Promise<TranslateResponse>;

interface LanguagesHelper {
  isSupported?: (lang: string) => boolean;
}

interface TranslateModuleLike {
  languages?: LanguagesHelper;
  default?: TranslateFunction & { languages?: LanguagesHelper };
  translate?: TranslateFunction & { languages?: LanguagesHelper };
}

function resolveTranslateImplementation(): {
  translate: TranslateFunction;
  isLanguageSupported: (lang: string) => boolean;
} {
  const candidateModule = rawTranslateModule as TranslateModuleLike | TranslateFunction;

  let translateCandidate: unknown;
  let languageSource: LanguagesHelper | undefined;

  if (typeof candidateModule === "function") {
    translateCandidate = candidateModule;
    languageSource = (candidateModule as TranslateFunction & {
      languages?: LanguagesHelper;
    }).languages;
  } else if (typeof candidateModule?.default === "function") {
    translateCandidate = candidateModule.default;
    languageSource =
      candidateModule.default.languages ?? candidateModule.languages;
  } else if (typeof candidateModule?.translate === "function") {
    translateCandidate = candidateModule.translate;
    languageSource =
      candidateModule.translate.languages ?? candidateModule.languages;
  }

  if (typeof translateCandidate !== "function") {
    const noop: TranslateFunction = async (text) => ({ text });
    const warnLogger = new Logger("MessageTranslationService");
    warnLogger.warn(
      "@vitalets/google-translate-api did not expose a callable function. Falling back to no-op translations.",
    );
    return {
      translate: noop,
      isLanguageSupported: () => true,
    };
  }

  const languages = languageSource;

  const isLanguageSupported = (lang: string) =>
    languages?.isSupported?.(lang) ?? true;

  return {
    translate: translateCandidate as TranslateFunction,
    isLanguageSupported,
  };
}

const { translate, isLanguageSupported } = resolveTranslateImplementation();

const MAX_TRANSLATE_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 700;
const REQUEST_GAP_MS = 350;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const MAX_CACHE_ENTRIES = 500;
const MY_MEMORY_ENDPOINT =
  process.env.MY_MEMORY_ENDPOINT ?? "https://api.mymemory.translated.net/get";
const MY_MEMORY_DETECT_ENDPOINT =
  process.env.MY_MEMORY_DETECT_ENDPOINT ?? "https://api.mymemory.translated.net/detect";
const MY_MEMORY_EMAIL = process.env.MY_MEMORY_EMAIL ?? undefined;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const LANGUAGE_OVERRIDES: Record<string, string> = {
  "pt-br": "pt",
  "zh-cn": "zh-cn",
  "zh-tw": "zh-tw",
};

type CachedTranslation = {
  text: string;
  detectedIso?: string;
  expiresAt: number;
};

export type TranslationResult = {
  detectedLanguage: string | null;
  translations: Record<string, string>;
};

@Injectable()
export class MessageTranslationService {
  private static readonly translationCache = new Map<string, CachedTranslation>();

  private readonly logger = new Logger(MessageTranslationService.name);
  private translationQueue: Promise<unknown> = Promise.resolve();

  normalizeLanguage(language?: string | null): string | null {
    if (!language) {
      return null;
    }

    const trimmed = language.trim();
    if (!trimmed) {
      return null;
    }

    const lower = trimmed.toLowerCase();

    if (ISO6391.validate(lower)) {
      return lower;
    }

    const [base] = lower.split("-");
    if (base && ISO6391.validate(base)) {
      return base;
    }

    const fromName = ISO6391.getCode(trimmed);
    if (fromName) {
      return fromName.toLowerCase();
    }

    return LANGUAGE_OVERRIDES[lower] ?? null;
  }

  async translateContent(
    content: string,
    targetLanguages: string[],
    options: { sourceLanguage?: string | null } = {},
  ): Promise<TranslationResult> {
    if (!content || !content.trim()) {
      return { detectedLanguage: null, translations: {} };
    }

    const uniqueTargets = Array.from(
      new Set(
        targetLanguages
          .map((lang) => lang?.toLowerCase())
          .filter((lang): lang is string => Boolean(lang)),
      ),
    ).filter((lang) => isLanguageSupported(lang));

    if (uniqueTargets.length === 0) {
      return {
        detectedLanguage: options.sourceLanguage ?? null,
        translations: {},
      };
    }

    let detectedLanguage =
      options.sourceLanguage?.toLowerCase() ?? null;
    const translations: Record<string, string> = {};

    for (const target of uniqueTargets) {
      if (detectedLanguage && target === detectedLanguage) {
        continue;
      }

      const result = await this.getTranslationWithCache(
        content,
        target,
        detectedLanguage,
      );

      if (!result) {
        const fallback = await this.translateWithMyMemory(
          content,
          target,
          detectedLanguage,
        );
        if (!fallback) {
          continue;
        }
        this.logger.log(
          `Fallback translation (MyMemory) used for ${target}`,
        );
        translations[target] = fallback.text;
        if (!detectedLanguage && fallback.detectedIso) {
          detectedLanguage = fallback.detectedIso;
        }
        continue;
      }

      if (!detectedLanguage && result.detectedIso) {
        detectedLanguage = result.detectedIso;

        if (target === detectedLanguage) {
          continue;
        }
      }

      translations[target] = result.text;
    }

    return { detectedLanguage, translations };
  }

  private async getTranslationWithCache(
    content: string,
    target: string,
    sourceLanguage: string | null,
  ): Promise<{ text: string; detectedIso?: string } | null> {
    const cacheKey = `${sourceLanguage ?? "auto"}|${target}|${content}`;

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.log(
        `Serving cached translation for ${target} (detected=${cached.detectedIso ?? "?"})`,
      );
      return cached;
    }

    const task = async () =>
      this.translateWithRetry(content, target, sourceLanguage);

    const result = await this.enqueueTranslation(task);

    if (result) {
      this.storeInCache(cacheKey, result);
    }

    return result;
  }

  private enqueueTranslation<T>(task: () => Promise<T>): Promise<T> {
    const next = this.translationQueue.then(task);
    this.translationQueue = next
      .then(() => delay(REQUEST_GAP_MS))
      .catch(() => delay(REQUEST_GAP_MS));
    return next;
  }

  private getFromCache(key: string): { text: string; detectedIso?: string } | null {
    const cached = MessageTranslationService.translationCache.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < Date.now()) {
      MessageTranslationService.translationCache.delete(key);
      return null;
    }

    return { text: cached.text, detectedIso: cached.detectedIso };
  }

  private storeInCache(
    key: string,
    value: { text: string; detectedIso?: string },
  ): void {
    MessageTranslationService.translationCache.set(key, {
      ...value,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    while (MessageTranslationService.translationCache.size > MAX_CACHE_ENTRIES) {
      const iterator = MessageTranslationService.translationCache.keys().next();
      if (iterator.done) {
        break;
      }
      MessageTranslationService.translationCache.delete(iterator.value);
    }
  }

  private async translateWithRetry(
    content: string,
    target: string,
    sourceLanguage: string | null,
  ): Promise<{ text: string; detectedIso?: string } | null> {
    for (let attempt = 0; attempt < MAX_TRANSLATE_ATTEMPTS; attempt += 1) {
      try {
        const result = await translate(content, {
          from: sourceLanguage ?? "auto",
          to: target,
        });

        const detectedIso = result?.from?.language?.iso?.toLowerCase();

        return { text: result.text, detectedIso };
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : String(error);

        const tooManyRequests = reason.toLowerCase().includes(
          "too many requests",
        );

        if (tooManyRequests && attempt < MAX_TRANSLATE_ATTEMPTS - 1) {
          const backoff = INITIAL_BACKOFF_MS * (attempt + 1);
          this.logger.warn(
            `Rate limited while translating to ${target}, retrying in ${backoff}ms (attempt ${attempt + 1})`,
          );
          await delay(backoff);
          continue;
        }

        this.logger.warn(
          `Unable to translate message to ${target} after ${attempt + 1} attempts: ${reason}`,
        );
        return null;
      }
    }

    return null;
  }

  private async translateWithMyMemory(
    content: string,
    target: string,
    sourceLanguage: string | null,
  ): Promise<{ text: string; detectedIso?: string } | null> {
    if (!MY_MEMORY_ENDPOINT) {
      return null;
    }

    let resolvedSource = sourceLanguage?.toLowerCase() ?? null;

    if (!resolvedSource) {
      resolvedSource = await this.detectSourceLanguage(content);
    }

    if (!resolvedSource) {
      this.logger.warn(
        `MyMemory fallback skipped for ${target}: unable to detect source language`,
      );
      return null;
    }

    const params = new URLSearchParams({
      q: content,
      langpair: `${resolvedSource}|${target}`,
    });

    if (MY_MEMORY_EMAIL) {
      params.set("de", MY_MEMORY_EMAIL);
    }

    const url = `${MY_MEMORY_ENDPOINT}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(
          `MyMemory request failed for ${target}: ${response.status} ${body}`,
        );
        return null;
      }

      const data = (await response.json()) as {
        responseData?: {
          translatedText?: string;
          detectedSourceLanguage?: string;
        };
      };

      const translatedText = data.responseData?.translatedText;
      if (!translatedText) {
        return null;
      }

      return {
        text: translatedText,
        detectedIso: resolvedSource ?? data.responseData?.detectedSourceLanguage?.toLowerCase(),
      };
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `MyMemory fallback failed for ${target}: ${reason}`,
      );
      return null;
    }
  }

  private async detectSourceLanguage(text: string): Promise<string | null> {
    if (!MY_MEMORY_DETECT_ENDPOINT) {
      return null;
    }

    const params = new URLSearchParams({ q: text });
    if (MY_MEMORY_EMAIL) {
      params.set("de", MY_MEMORY_EMAIL);
    }

    try {
      const response = await fetch(`${MY_MEMORY_DETECT_ENDPOINT}?${params.toString()}`);
      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(
          `MyMemory detect failed: ${response.status} ${body}`,
        );
        return null;
      }

      const data = (await response.json()) as {
        language?: string;
      };

      return data.language?.toLowerCase() ?? null;
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`MyMemory detect threw an error: ${reason}`);
      return null;
    }
  }
}
