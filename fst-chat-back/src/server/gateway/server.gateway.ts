import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import * as cookie from 'cookie';

@WebSocketGateway({ cors: true })
@Injectable()
export class ServerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly tokenService: TokenService) {}

  // serverId -> (userId -> count of sockets)
  private presence: Map<string, Map<string, number>> = new Map();

  async handleConnection(client: Socket) {
    const rawCookie = client.handshake?.headers?.cookie;
    if (!rawCookie) {
      client.disconnect();
      return;
    }
    try {
      const parsed = cookie.parse(rawCookie);
      const token = parsed['fst_chat_token'];
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = await this.tokenService.verifyToken(token);
      if (!payload?.sub) {
        client.disconnect();
        return;
      }
      client.data.id = payload.sub as string;
      Logger.log(`[ServerGateway] connected socket=${client.id} user=${client.data.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId: string | undefined = client.data?.id;
    if (!userId) return;
    // Any server rooms this client was in?
    for (const room of Array.from(client.rooms)) {
      if (!room.startsWith('server:')) continue;
      const serverId = room.slice('server:'.length);
      this.decrementPresence(serverId, userId);
      this.emitPresence(serverId);
    }
  }

  private incrementPresence(serverId: string, userId: string) {
    if (!this.presence.has(serverId)) this.presence.set(serverId, new Map());
    const map = this.presence.get(serverId)!;
    map.set(userId, (map.get(userId) ?? 0) + 1);
  }

  private decrementPresence(serverId: string, userId: string) {
    const map = this.presence.get(serverId);
    if (!map) return;
    const current = (map.get(userId) ?? 0) - 1;
    if (current <= 0) map.delete(userId); else map.set(userId, current);
  }

  private emitPresence(serverId: string) {
    const map = this.presence.get(serverId);
    const onlineUserIds = map ? Array.from(map.keys()) : [];
    this.emitServerPresenceUpdate(serverId, onlineUserIds);
  }

  emitServerMemberJoined(serverId: string, user: any) {
    // Debug: émission d'un event d'entrée membre
    console.log('[Gateway] emitServerMemberJoined ->', { serverId, userId: user?.id || user?._id });
    // diffuse uniquement aux sockets qui regardent ce serveur
    this.server.to(this.serverRoom(serverId)).emit('serverMemberJoined', { serverId, user });
  }

  emitServerPresenceUpdate(serverId: string, onlineUserIds: string[]) {
    this.server.to(this.serverRoom(serverId)).emit('serverPresenceUpdate', { serverId, onlineUserIds });
  }

  emitServerMemberLeft(serverId: string, userId: string) {
    this.server.to(this.serverRoom(serverId)).emit('serverMemberLeft', { serverId, userId });
  }

  emitChannelDeleted(serverId: string, channelId: string) {
    // Inform all watchers of this server that a channel was deleted
    this.server.to(this.serverRoom(serverId)).emit('channelDeleted', { serverId, channelId });
    // Also notify sockets in the channel room directly if any remain
    this.server.to(channelId).emit('channelDeleted', { serverId, channelId });
  }

  private serverRoom(serverId: string) {
    return `server:${serverId}`;
  }

  emitServerDeleted(serverId: string) {
    this.server.to(this.serverRoom(serverId)).emit('serverDeleted', { serverId });
  }

  @SubscribeMessage('watchServer')
  async handleWatchServer(@MessageBody() data: { serverId: string }, @ConnectedSocket() client: Socket) {
    const serverId = data?.serverId;
    if (!serverId) return;
    console.log('[Gateway] watchServer -> client joins room', { serverId, socketId: client.id });
    client.join(this.serverRoom(serverId));
    const userId: string | undefined = client.data?.id;
    if (userId) {
      this.incrementPresence(serverId, userId);
      this.emitPresence(serverId);
    }
  }

  @SubscribeMessage('unwatchServer')
  handleUnwatchServer(@MessageBody() data: { serverId: string }, @ConnectedSocket() client: Socket) {
    const serverId = data?.serverId;
    if (!serverId) return;
    console.log('[Gateway] unwatchServer -> client leaves room', { serverId, socketId: client.id });
    client.leave(this.serverRoom(serverId));
    const userId: string | undefined = client.data?.id;
    if (userId) {
      this.decrementPresence(serverId, userId);
      this.emitPresence(serverId);
    }
  }

  // no per-channel presence tracking in this simplified version
}
