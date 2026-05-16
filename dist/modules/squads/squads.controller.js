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
exports.SquadsController = void 0;
const common_1 = require("@nestjs/common");
const squads_service_1 = require("./squads.service");
const create_squad_dto_1 = require("./dto/create-squad.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SquadsController = class SquadsController {
    constructor(squadsService) {
        this.squadsService = squadsService;
    }
    getSuggested(gymId) {
        return this.squadsService.getSuggestedSquads(gymId);
    }
    getActive(gymId) {
        return this.squadsService.getActiveSquads(gymId);
    }
    formSquad(dto) {
        return this.squadsService.formSquad(dto);
    }
    joinSquad(squadId, user) {
        return this.squadsService.joinSquad(squadId, user.sub);
    }
    leaveSquad(squadId, user) {
        return this.squadsService.leaveSquad(squadId, user.sub);
    }
};
exports.SquadsController = SquadsController;
__decorate([
    (0, common_1.Get)(':gymId/suggested'),
    __param(0, (0, common_1.Param)('gymId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SquadsController.prototype, "getSuggested", null);
__decorate([
    (0, common_1.Get)(':gymId/active'),
    __param(0, (0, common_1.Param)('gymId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SquadsController.prototype, "getActive", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_squad_dto_1.CreateSquadDto]),
    __metadata("design:returntype", void 0)
], SquadsController.prototype, "formSquad", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SquadsController.prototype, "joinSquad", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SquadsController.prototype, "leaveSquad", null);
exports.SquadsController = SquadsController = __decorate([
    (0, common_1.Controller)('squads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [squads_service_1.SquadsService])
], SquadsController);
//# sourceMappingURL=squads.controller.js.map