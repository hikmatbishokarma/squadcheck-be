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
exports.LobbyController = void 0;
const common_1 = require("@nestjs/common");
const lobby_service_1 = require("./lobby.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let LobbyController = class LobbyController {
    constructor(lobbyService) {
        this.lobbyService = lobbyService;
    }
    join(user, gymId) {
        return this.lobbyService.joinLobby(user.sub, gymId);
    }
    leave(user, gymId) {
        return this.lobbyService.leaveLobby(user.sub, gymId);
    }
    setWorkoutFocus(user, focus) {
        return this.lobbyService.setWorkoutFocus(user.sub, focus);
    }
    getActiveUsers(gymId) {
        return this.lobbyService.getActiveUsers(gymId);
    }
    getFamiliarFaces(user, gymId) {
        return this.lobbyService.getFamiliarFaces(user.sub, gymId);
    }
    getInsights(gymId) {
        return this.lobbyService.getInsights(gymId);
    }
};
exports.LobbyController = LobbyController;
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('gymId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LobbyController.prototype, "join", null);
__decorate([
    (0, common_1.Post)('leave'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('gymId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LobbyController.prototype, "leave", null);
__decorate([
    (0, common_1.Patch)('workout-focus'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('focus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LobbyController.prototype, "setWorkoutFocus", null);
__decorate([
    (0, common_1.Get)(':gymId/users'),
    __param(0, (0, common_1.Param)('gymId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LobbyController.prototype, "getActiveUsers", null);
__decorate([
    (0, common_1.Get)(':gymId/familiar-faces'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('gymId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LobbyController.prototype, "getFamiliarFaces", null);
__decorate([
    (0, common_1.Get)(':gymId/insights'),
    __param(0, (0, common_1.Param)('gymId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LobbyController.prototype, "getInsights", null);
exports.LobbyController = LobbyController = __decorate([
    (0, common_1.Controller)('lobby'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [lobby_service_1.LobbyService])
], LobbyController);
//# sourceMappingURL=lobby.controller.js.map