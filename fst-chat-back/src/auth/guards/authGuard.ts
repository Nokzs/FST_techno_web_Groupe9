import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserAuthService } from '../service/auth.service';

const cookieKey = 'fst_chat_token';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: UserAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    //récupèrer la clé du cookie dans les paramètre de la guard;
    const token = request.cookies[cookieKey];
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.authService.verifyToken(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
