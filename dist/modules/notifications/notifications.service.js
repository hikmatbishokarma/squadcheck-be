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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const push_subscription_schema_1 = require("../../database/schemas/push-subscription.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
let NotificationsService = class NotificationsService {
    constructor(pushSubModel, userModel) {
        this.pushSubModel = pushSubModel;
        this.userModel = userModel;
    }
    async subscribe(userId, dto) {
        const user = await this.userModel.findById(userId).select('checkinHours');
        const preferredHour = this.computePreferredHour(user?.checkinHours ?? []);
        await this.pushSubModel.findOneAndUpdate({ userId: new mongoose_2.Types.ObjectId(userId) }, {
            userId: new mongoose_2.Types.ObjectId(userId),
            endpoint: dto.endpoint,
            p256dh: dto.p256dh,
            auth: dto.auth,
            preferredCheckinHour: preferredHour,
            enabled: true,
        }, { upsert: true, new: true });
        return { ok: true };
    }
    async unsubscribe(userId) {
        await this.pushSubModel.findOneAndDelete({ userId: new mongoose_2.Types.ObjectId(userId) });
        return { ok: true };
    }
    async getSubscription(userId) {
        return this.pushSubModel.findOne({ userId: new mongoose_2.Types.ObjectId(userId) });
    }
    async getUsersDueForReminder() {
        const now = new Date();
        const targetHour = now.getHours();
        const targetMinute = now.getMinutes();
        const reminderHour = targetMinute >= 15 ? targetHour + 1 : targetHour;
        return this.pushSubModel.find({
            enabled: true,
            preferredCheckinHour: reminderHour,
        });
    }
    computePreferredHour(hours) {
        if (hours.length === 0)
            return 18;
        const recent = hours.slice(-10);
        const sum = recent.reduce((a, b) => a + b, 0);
        return Math.round(sum / recent.length);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(push_subscription_schema_1.PushSubscription.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map