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
exports.LobbyService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
const lobby_session_schema_1 = require("../../database/schemas/lobby-session.schema");
const ai_service_1 = require("../ai/ai.service");
function toMidnight(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function prevWeekdayBefore(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() - 1);
    }
    return toMidnight(d);
}
const STREAK_MILESTONES = [7, 14, 21, 30, 42, 60, 90];
function computeStreak(user) {
    const now = new Date();
    const today = toMidnight(now);
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
        return {
            newStreak: user.currentStreak ?? 0,
            isWeekend: true,
            isWeekendBonus: true,
            alreadyCheckedIn: false,
            milestoneHit: false,
        };
    }
    const lastWeekday = user.lastWeekdayCheckinDate;
    if (lastWeekday && toMidnight(lastWeekday).getTime() === today.getTime()) {
        return {
            newStreak: user.currentStreak ?? 0,
            isWeekend: false,
            isWeekendBonus: false,
            alreadyCheckedIn: true,
            milestoneHit: false,
        };
    }
    let newStreak;
    if (!lastWeekday) {
        newStreak = 1;
    }
    else {
        const prevWd = prevWeekdayBefore(today);
        const lastWdMidnight = toMidnight(lastWeekday);
        if (lastWdMidnight.getTime() === prevWd.getTime()) {
            newStreak = (user.currentStreak ?? 0) + 1;
        }
        else {
            newStreak = 1;
        }
    }
    const milestoneHit = STREAK_MILESTONES.includes(newStreak);
    return {
        newStreak,
        isWeekend: false,
        isWeekendBonus: false,
        alreadyCheckedIn: false,
        milestoneHit,
    };
}
let LobbyService = class LobbyService {
    constructor(userModel, sessionModel, aiService) {
        this.userModel = userModel;
        this.sessionModel = sessionModel;
        this.aiService = aiService;
    }
    async joinLobby(userId, gymId) {
        const user = await this.userModel.findById(userId);
        const streakResult = user ? computeStreak(user) : {
            newStreak: 1,
            isWeekend: false,
            isWeekendBonus: false,
            alreadyCheckedIn: false,
            milestoneHit: false,
        };
        const now = new Date();
        const dayOfWeek = now.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const checkinHour = now.getHours();
        const existingHours = user?.checkinHours ?? [];
        const updatedHours = [...existingHours, checkinHour].slice(-20);
        const updatePayload = {
            isOnline: true,
            currentGymId: gymId,
            $inc: { totalCheckins: 1 },
            checkinHours: updatedHours,
        };
        if (isWeekend) {
            updatePayload.$inc.weekendSessions = 1;
            const bonusName = dayOfWeek === 6 ? 'Saturday Discipline' : 'Sunday Session Bonus';
            updatePayload.$addToSet = { weekendBonuses: bonusName };
        }
        else if (!streakResult.alreadyCheckedIn) {
            updatePayload.currentStreak = streakResult.newStreak;
            updatePayload.streakCount = streakResult.newStreak;
            updatePayload.lastWeekdayCheckinDate = now;
            if (streakResult.newStreak > (user?.longestStreak ?? 0)) {
                updatePayload.longestStreak = streakResult.newStreak;
            }
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, updatePayload, { new: true });
        await this.sessionModel.create({
            userId,
            gymId,
            joinedAt: now,
            dayOfWeek,
            isWeekend,
        });
        const users = await this.getActiveUsers(gymId);
        return { users, streakResult, user: updatedUser };
    }
    async leaveLobby(userId, gymId) {
        const user = await this.userModel.findById(userId);
        if (!user?.isOnline)
            return;
        const coTrainees = await this.userModel
            .find({ currentGymId: { $in: [gymId, new mongoose_2.Types.ObjectId(gymId)] }, isOnline: true, _id: { $ne: new mongoose_2.Types.ObjectId(userId) } })
            .select('_id');
        await this.userModel.findByIdAndUpdate(userId, {
            isOnline: false,
            currentGymId: null,
        });
        const session = await this.sessionModel
            .findOne({ userId, gymId, leftAt: null })
            .sort({ joinedAt: -1 });
        if (session) {
            const leftAt = new Date();
            const durationMinutes = Math.round((leftAt.getTime() - session.joinedAt.getTime()) / 60000);
            await this.sessionModel.findByIdAndUpdate(session._id, {
                leftAt,
                durationMinutes,
                coTrainees: coTrainees.map((u) => u._id),
                workoutFocus: user.workoutFocus,
            });
        }
    }
    async setWorkoutFocus(userId, focus) {
        return this.userModel.findByIdAndUpdate(userId, { workoutFocus: focus }, { new: true });
    }
    async getActiveUsers(gymId) {
        return this.userModel
            .find({ currentGymId: { $in: [gymId, new mongoose_2.Types.ObjectId(gymId)] }, isOnline: true })
            .select('name avatar currentStreak longestStreak weekendSessions fitnessGoal preferredTime fitnessLevel workoutFocus lookingForSquad streakCount');
    }
    async getFamiliarFaces(userId, gymId) {
        const userSessions = await this.sessionModel.find({
            userId,
            gymId,
            leftAt: { $ne: null },
        }).select('coTrainees');
        const overlapMap = new Map();
        for (const session of userSessions) {
            for (const coId of session.coTrainees ?? []) {
                const key = coId.toString();
                overlapMap.set(key, (overlapMap.get(key) ?? 0) + 1);
            }
        }
        if (overlapMap.size === 0)
            return [];
        const sorted = [...overlapMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        const users = await this.userModel
            .find({ _id: { $in: sorted.map(([id]) => id) } })
            .select('name avatar currentStreak workoutFocus streakCount');
        return sorted
            .map(([id, count]) => ({
            user: users.find((u) => u._id.toString() === id),
            overlapCount: count,
        }))
            .filter((x) => x.user != null);
    }
    async handleDisconnect(userId) {
        const user = await this.userModel.findById(userId);
        if (user?.isOnline && user.currentGymId) {
            await this.leaveLobby(userId, user.currentGymId.toString());
        }
    }
    async getInsights(gymId) {
        const users = await this.userModel
            .find({ currentGymId: { $in: [gymId, new mongoose_2.Types.ObjectId(gymId)] }, isOnline: true })
            .select('workoutFocus currentStreak streakCount preferredTime fitnessLevel');
        return this.aiService.generateGymInsights(users.map((u) => ({
            workoutFocus: u.workoutFocus,
            currentStreak: u.currentStreak ?? u.streakCount ?? 0,
            preferredTime: u.preferredTime,
            fitnessLevel: u.fitnessLevel,
        })));
    }
};
exports.LobbyService = LobbyService;
exports.LobbyService = LobbyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(lobby_session_schema_1.LobbySession.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        ai_service_1.AiService])
], LobbyService);
//# sourceMappingURL=lobby.service.js.map