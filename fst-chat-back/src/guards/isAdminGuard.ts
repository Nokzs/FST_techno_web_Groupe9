import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

import { Request } from 'express';
import { TokenService } from '../token/token.service';
import { ServerService } from '../server/service/server.service';

@Injectable()
export class isAdminGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly serverService: ServerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    Logger.log("Vérification de l'admin'");
    const request: Request = context.switchToHttp().getRequest();

    // 1️⃣ Récupération du token depuis les cookies
    const token: string = request.cookies['fst_chat_token'];
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }
    Logger.log('le body', request.body);
    // 2️⃣ Vérification du serveur ciblé
    const serverId =
      request.params.serverId ||
      request.body.serverId ||
      request.query.serverId;
    if (!serverId) throw new ForbiddenException('Server ID manquant');

    // 3️⃣ Vérification du token et récupération du payload
    let payload;
    try {
      payload = await this.tokenService.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Token invalide');
    }

    if (!payload) {
      throw new UnauthorizedException('Utilisateur invalide');
    }

    // 4️⃣ Récupération du serveur
    const server = await this.serverService.getServerFromId(serverId);
    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }

    // 5️⃣ Vérification que l'utilisateur est bien le propriétaire
    if (server.ownerId.toString() !== payload.sub) {
      throw new ForbiddenException(
        'Accès refusé — vous n’êtes pas le propriétaire'
      );
    }

    // 6️⃣ Ajout du payload à la requête
    request['user'] = payload;

    return true;
  }
}
