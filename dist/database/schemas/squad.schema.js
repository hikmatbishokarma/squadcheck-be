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
exports.SquadSchema = exports.Squad = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Squad = class Squad {
};
exports.Squad = Squad;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Squad.prototype, "squadName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Gym', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Squad.prototype, "gymId", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'User' }]),
    __metadata("design:type", Array)
], Squad.prototype, "members", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Squad.prototype, "vibe", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Squad.prototype, "challenge", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Squad.prototype, "icebreaker", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Squad.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date(Date.now() + 4 * 60 * 60 * 1000) }),
    __metadata("design:type", Date)
], Squad.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Squad.prototype, "squadStreak", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Squad.prototype, "lastSessionDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Squad.prototype, "totalSessionsTogether", void 0);
exports.Squad = Squad = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Squad);
exports.SquadSchema = mongoose_1.SchemaFactory.createForClass(Squad);
//# sourceMappingURL=squad.schema.js.map