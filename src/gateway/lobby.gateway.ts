import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LobbyService } from '../modules/lobby/lobby.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/lobby',
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { userId: string; gymId: string }>();

  constructor(
    private lobbyService: LobbyService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwtSecret'),
      });
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const session = this.connectedUsers.get(client.id);
    if (!session) return;

    await this.lobbyService.leaveLobby(session.userId, session.gymId);
    this.connectedUsers.delete(client.id);

    const activeUsers = await this.lobbyService.getActiveUsers(session.gymId);
    this.server.to(session.gymId).emit('lobby:user_left', {
      userId: session.userId,
      gymId: session.gymId,
    });
    this.server.to(session.gymId).emit('lobby:active_users', {
      gymId: session.gymId,
      users: activeUsers,
    });
  }

  @SubscribeMessage('lobby:join')
  async handleJoinLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gymId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.join(data.gymId);
    this.connectedUsers.set(client.id, { userId, gymId: data.gymId });

    const { users, streakResult, user } = await this.lobbyService.joinLobby(userId, data.gymId);

    const firstName = user.name?.split(' ')[0] ?? 'Someone';

    // Broadcast user joined with full context
    this.server.to(data.gymId).emit('lobby:user_joined', {
      userId,
      gymId: data.gymId,
      userName: firstName,
      userAvatar: user.avatar,
      workoutFocus: user.workoutFocus,
      currentStreak: user.currentStreak,
    });

    this.server.to(data.gymId).emit('lobby:active_users', {
      gymId: data.gymId,
      users,
    });

    // Weekend bonus activity
    if (streakResult.isWeekendBonus) {
      const day = new Date().getDay();
      const bonusName = day === 6 ? 'Saturday Discipline' : 'Sunday Session Bonus';
      this.server.to(data.gymId).emit('activity:event', {
        type: 'weekend_bonus',
        userId,
        userName: firstName,
        userAvatar: user.avatar,
        message: `earned the ${bonusName} bonus ⚡`,
        timestamp: new Date().toISOString(),
      });
    }

    // Streak milestone activity
    if (streakResult.milestoneHit) {
      this.server.to(data.gymId).emit('activity:event', {
        type: 'streak_milestone',
        userId,
        userName: firstName,
        userAvatar: user.avatar,
        message: `hit a ${streakResult.newStreak}-day streak! 🔥`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('lobby:leave')
  async handleLeaveLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gymId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    client.leave(data.gymId);
    this.connectedUsers.delete(client.id);

    await this.lobbyService.leaveLobby(userId, data.gymId);
    const activeUsers = await this.lobbyService.getActiveUsers(data.gymId);

    this.server.to(data.gymId).emit('lobby:user_left', { userId, gymId: data.gymId });
    this.server.to(data.gymId).emit('lobby:active_users', {
      gymId: data.gymId,
      users: activeUsers,
    });
  }

  @SubscribeMessage('lobby:workout_focus')
  async handleWorkoutFocus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gymId: string; focus: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const user = await this.lobbyService.setWorkoutFocus(userId, data.focus);
    const firstName = user?.name?.split(' ')[0] ?? 'Someone';

    // Broadcast updated presence state to everyone
    const activeUsers = await this.lobbyService.getActiveUsers(data.gymId);
    this.server.to(data.gymId).emit('lobby:active_users', {
      gymId: data.gymId,
      users: activeUsers,
    });

    // Always emit the focus event — the frontend replaces the existing
    // workout_focus entry for this user rather than appending a new one,
    // so there is never more than one focus line per person in the feed.
    this.server.to(data.gymId).emit('activity:event', {
      type: 'workout_focus',
      userId,
      userName: firstName,
      userAvatar: user?.avatar,
      message: `is doing ${data.focus} today 💪`,
      timestamp: new Date().toISOString(),
    });
  }

  emitSquadFormed(gymId: string, squad: any) {
    this.server.to(gymId).emit('squad:formed', squad);
    this.server.to(gymId).emit('activity:event', {
      type: 'squad_formed',
      userId: '',
      userName: squad.squadName,
      message: `Squad "${squad.squadName}" formed! 🔥`,
      timestamp: new Date().toISOString(),
    });
  }

  emitSquadUpdated(gymId: string, squad: any) {
    this.server.to(gymId).emit('squad:updated', squad);
  }

  emitSquadStreakUpdate(gymId: string, squadName: string, newStreak: number) {
    this.server.to(gymId).emit('activity:event', {
      type: 'squad_streak',
      userId: '',
      userName: squadName,
      message: `Squad streak is now ${newStreak} days! 🔥`,
      timestamp: new Date().toISOString(),
    });
  }
}
