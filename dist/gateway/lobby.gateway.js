"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const lobby_service_1 = require("../modules/lobby/lobby.service");
let LobbyGateway = class LobbyGateway {
    constructor(lobbyService, jwtService, configService) {
        this.lobbyService = lobbyService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
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
        }
        catch {
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const session = this.connectedUsers.get(client.id);
        if (!session)
            return;
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
    async handleJoinLobby(client, data) {
        const userId = client.data.userId;
        if (!userId)
            return;
        client.join(data.gymId);
        this.connectedUsers.set(client.id, { userId, gymId: data.gymId });
        const { users, streakResult, user } = await this.lobbyService.joinLobby(userId, data.gymId);
        const firstName = user.name?.split(' ')[0] ?? 'Someone';
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
    async handleLeaveLobby(client, data) {
        const userId = client.data.userId;
        if (!userId)
            return;
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
    async handleWorkoutFocus(client, data) {
        const userId = client.data.userId;
        if (!userId)
            return;
        const user = await this.lobbyService.setWorkoutFocus(userId, data.focus);
        const firstName = user?.name?.split(' ')[0] ?? 'Someone';
        const activeUsers = await this.lobbyService.getActiveUsers(data.gymId);
        this.server.to(data.gymId).emit('lobby:active_users', {
            gymId: data.gymId,
            users: activeUsers,
        });
        this.server.to(data.gymId).emit('activity:event', {
            type: 'workout_focus',
            userId,
            userName: firstName,
            userAvatar: user?.avatar,
            message: `is doing ${data.focus} today 💪`,
            timestamp: new Date().toISOString(),
        });
    }
    emitSquadFormed(gymId, squad) {
        this.server.to(gymId).emit('squad:formed', squad);
        this.server.to(gymId).emit('activity:event', {
            type: 'squad_formed',
            userId: '',
            userName: squad.squadName,
            message: `Squad "${squad.squadName}" formed! 🔥`,
            timestamp: new Date().toISOString(),
        });
    }
    emitSquadUpdated(gymId, squad) {
        this.server.to(gymId).emit('squad:updated', squad);
    }
    emitSquadStreakUpdate(gymId, squadName, newStreak) {
        this.server.to(gymId).emit('activity:event', {
            type: 'squad_streak',
            userId: '',
            userName: squadName,
            message: `Squad streak is now ${newStreak} days! 🔥`,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.LobbyGateway = LobbyGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LobbyGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('lobby:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LobbyGateway.prototype, "handleJoinLobby", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('lobby:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LobbyGateway.prototype, "handleLeaveLobby", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('lobby:workout_focus'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LobbyGateway.prototype, "handleWorkoutFocus", null);
exports.LobbyGateway = LobbyGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/lobby',
    }),
    __metadata("design:paramtypes", [lobby_service_1.LobbyService,
        jwt_1.JwtService,
        config_1.ConfigService])
], LobbyGateway);
//# sourceMappingURL=lobby.gateway.js.map