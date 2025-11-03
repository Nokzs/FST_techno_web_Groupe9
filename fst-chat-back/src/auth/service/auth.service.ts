import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { User, UserDocument } from '../../user/schema/user.schema';
type PlainUser = {
  id?: string;
  _id?: unknown;
  pseudo?: string;
  email?: string;
  language?: string;
  isAdmin?: boolean;
  lastConnectedAt?: Date;
  createdAt?: Date;
  password?: string;
};

export type SanitizedUser = {
  id: string;
  pseudo?: string;
  email?: string;
  language?: string;
  isAdmin: boolean;
  lastConnectedAt?: Date;
  createdAt?: Date;
};

@Injectable()
export class UserAuthService {
  private readonly authCookieName = 'fst_chat_token';
  private readonly cookieMaxAgeMs: number;
  private readonly isSecureCookie: boolean;

  constructor(private readonly configService: ConfigService) {
    const expires =
      this.configService.get<string>('JWT_EXPIRES_IN', '1h') ?? '1h';
    this.cookieMaxAgeMs = this.resolveCookieMaxAge(expires);
    this.isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
  }
  /**
   * Supprime les informations sensibles d'un user avant de le renvoyer au client.
   * @param
   * user L'utilisateur à assainir.
   * @returns L'utilisateur assaini.
   */
  sanitizeUser(user: User | UserDocument): SanitizedUser {
    const plain = this.toPlainUser(user);
    const { password: _password, _id, id, ...rest } = plain;
    void _password;

    return {
      id: this.resolveId(id, _id),
      pseudo: rest.pseudo,
      email: rest.email,
      language: rest.language,
      isAdmin: rest.isAdmin ?? false,
      lastConnectedAt: rest.lastConnectedAt,
      createdAt: rest.createdAt,
    };
  }
  /**
   * Attache un token JWT pour un utilisateur donné.
   * @param user L'utilisateur pour lequel générer le token.
   * @returns Le token JWT généré.
   */
  attachAuthCookie(res: Response, token: string): void {
    console.log('Attaching auth cookie with token:', token);
    res.cookie(this.authCookieName, token, {
      httpOnly: true,
      sameSite: this.isSecureCookie ? 'none' : 'lax',
      secure: this.isSecureCookie,
      maxAge: this.cookieMaxAgeMs,
    });
  }
  /**
   * Récupère l'ID utilisateur à partir d'un objet User ou UserDocument.
   * @param user L'utilisateur dont on veut obtenir l'ID.
   * @returns L'ID utilisateur sous forme de chaîne de caractères.
   */
  getUserId(user: User | UserDocument): string {
    const documentCandidate = user as UserDocument;
    if (
      typeof documentCandidate.id === 'string' &&
      documentCandidate.id.length > 0
    ) {
      return documentCandidate.id;
    }

    return this.resolveId(
      (user as { id?: string }).id,
      (user as { _id?: unknown })._id
    );
  }
  /**
   * Résout la durée maximale du cookie à partir d'une chaîne de caractères.
   * @param duration La durée sous forme de chaîne (ex: "3600", "1h", "30m").
   * @returns La durée en millisecondes.
   */
  private resolveCookieMaxAge(duration: string): number {
    const numericValue = Number(duration);
    if (!Number.isNaN(numericValue)) {
      return numericValue * 1000;
    }

    const match = duration
      .trim()
      .toLowerCase()
      .match(/^(\d+)([smhd])$/);
    if (!match) {
      return 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];

    const unitMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (unitMap[unit] ?? unitMap.h);
  }
  /**
   * Convertit un User ou UserDocument en PlainUser.
   * @param user L'utilisateur à convertir.
   * @returns L'utilisateur converti en PlainUser.
   */
  private toPlainUser(user: User | UserDocument): PlainUser {
    if (typeof (user as UserDocument).toObject === 'function') {
      return (user as UserDocument).toObject() as PlainUser;
    }

    const plainUser = user as User;
    return {
      pseudo: plainUser.pseudo,
      email: plainUser.email,
      language: plainUser.language,
      isAdmin: plainUser.isAdmin,
      lastConnectedAt: plainUser.lastConnectedAt,
      createdAt: plainUser.createdAt,
      password: plainUser.password,
      id: (plainUser as { id?: string }).id,
      _id: (plainUser as { _id?: unknown })._id,
    };
  }
  /**
   *
   * Résout l'ID utilisateur à partir de différentes sources.
   * @param id L'ID utilisateur sous forme de chaîne (optionnel).
   * @param rawId L'ID utilisateur sous forme brute (optionnel).
   * @returns L'ID utilisateur sous forme de chaîne.
   */
  private resolveId(id?: string, rawId?: unknown): string {
    if (id && id.length > 0) {
      return id;
    }

    if (rawId !== undefined && rawId !== null) {
      if (typeof rawId === 'string') {
        return rawId;
      }

      const candidate = rawId as { toString?: () => string };
      if (typeof candidate.toString === 'function') {
        return candidate.toString();
      }
    }

    return '';
  }
  /**
   * Supprime le cookie d'authentification.
   * @param res La réponse Express pour laquelle supprimer le cookie.
   */
  public clearCookie(res: Response): void {
    res.clearCookie('fst_chat_token', {
      httpOnly: true,
      sameSite: this.isSecureCookie ? 'none' : 'lax',
      secure: this.isSecureCookie,
    });
  }
}
