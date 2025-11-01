import { Injectable, Logger } from '@nestjs/common';
import { translate } from '@vitalets/google-translate-api';
import ISO6391 from 'iso-639-1';

export type EnsureTranslationResult = {
  translatedText: string;
  detectedLanguage: string;
  shouldPersistTranslation: boolean;
  shouldPersistDetection: boolean;
  targetLanguage: string;
};

@Injectable()
export class MessageTranslationService {
  private readonly logger = new Logger(MessageTranslationService.name);

  resolveLanguageCode(language?: string | null): string {
    if (!language) {
      return 'en';
    }

    const trimmed = language.trim();
    if (!trimmed) {
      return 'en';
    }
    const lower = trimmed.toLowerCase();
    if (ISO6391.validate(lower)) {
      return lower;
    }

    const firstSegment = lower.split(/[-_]/)[0];
    if (ISO6391.validate(firstSegment)) {
      return firstSegment;
    }

    const code = ISO6391.getCode(trimmed);
    if (code) {
      return code;
    }

    const capitalized =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    const fallbackCode = ISO6391.getCode(capitalized);
    if (fallbackCode) {
      return fallbackCode;
    }

    return 'en';
  }

  async detectLanguage(text: string): Promise<string> {
    if (!text || !text.trim()) {
      return 'auto';
    }
    try {
      const { raw } = await translate(text, { to: 'en' });
      const detected = raw?.src;
      if (typeof detected === 'string' && ISO6391.validate(detected)) {
        return detected.toLowerCase();
      }
    } catch (error) {
      this.logger.warn(
        `Language detection failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    return 'auto';
  }

  async translateText(
    text: string,
    targetLanguage: string,
    detectedLanguage?: string
  ): Promise<string> {
    if (!text || !text.trim()) {
      return text;
    }

    const normalizedTarget = this.resolveLanguageCode(targetLanguage);
    const normalizedSource =
      detectedLanguage && detectedLanguage !== 'auto'
        ? detectedLanguage
        : undefined;

    if (normalizedSource && normalizedSource === normalizedTarget) {
      return text;
    }

    try {
      const { text: translated } = await translate(text, {
        to: normalizedTarget,
        ...(normalizedSource ? { from: normalizedSource } : {}),
      });
      return translated;
    } catch (error) {
      this.logger.warn(
        `Translation failed for ${normalizedTarget}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return text;
    }
  }

  async buildTranslations(
    text: string,
    targetLanguages: Iterable<string>,
    detectedLanguage?: string
  ): Promise<{
    detectedLanguage: string;
    translations: Record<string, string>;
  }> {
    const translations: Record<string, string> = {};
    const detection =
      detectedLanguage && detectedLanguage !== 'auto'
        ? detectedLanguage
        : await this.detectLanguage(text);

    for (const lang of targetLanguages) {
      const code = this.resolveLanguageCode(lang);
      if (translations[code]) {
        continue;
      }

      if (code === detection) {
        translations[code] = text;
        continue;
      }

      translations[code] = await this.translateText(text, code, detection);
    }

    if (Object.keys(translations).length === 0) {
      const fallbackCode =
        detection && detection !== 'auto'
          ? detection
          : this.resolveLanguageCode('en');
      translations[fallbackCode] = text;
    }

    return { detectedLanguage: detection, translations };
  }

  async ensureTranslation(
    text: string,
    targetLanguage: string,
    existingTranslation?: string,
    detectedLanguage?: string
  ): Promise<EnsureTranslationResult> {
    const normalizedTarget = this.resolveLanguageCode(targetLanguage);

    const detection =
      detectedLanguage && detectedLanguage !== 'auto'
        ? detectedLanguage
        : await this.detectLanguage(text);

    let shouldPersistDetection = false;
    if (detectedLanguage !== detection && detection !== 'auto') {
      shouldPersistDetection = true;
    }

    if (existingTranslation) {
      return {
        translatedText: existingTranslation,
        detectedLanguage: detection,
        shouldPersistDetection,
        shouldPersistTranslation: false,
        targetLanguage: normalizedTarget,
      };
    }

    if (detection === normalizedTarget) {
      return {
        translatedText: text,
        detectedLanguage: detection,
        shouldPersistDetection,
        shouldPersistTranslation: true,
        targetLanguage: normalizedTarget,
      };
    }

    const translated = await this.translateText(
      text,
      normalizedTarget,
      detection
    );

    return {
      translatedText: translated,
      detectedLanguage: detection,
      shouldPersistDetection,
      shouldPersistTranslation: true,
      targetLanguage: normalizedTarget,
    };
  }
}
