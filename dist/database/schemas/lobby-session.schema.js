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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbySessionSchema = exports.LobbySession = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let LobbySession = class LobbySession {
};
exports.LobbySession = LobbySession;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LobbySession.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Gym', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LobbySession.prototype, "gymId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], LobbySession.prototype, "joinedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LobbySession.prototype, "leftAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], LobbySession.prototype, "durationMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Cardio', 'Full Body', 'Recovery'] }),
    __metadata("design:type", String)
], LobbySession.prototype, "workoutFocus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], LobbySession.prototype, "dayOfWeek", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], LobbySession.prototype, "isWeekend", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'User' }]),
    __metadata("design:type", Array)
], LobbySession.prototype, "coTrainees", void 0);
exports.LobbySession = LobbySession = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LobbySession);
exports.LobbySessionSchema = mongoose_1.SchemaFactory.createForClass(LobbySession);
//# sourceMappingURL=lobby-session.schema.js.map