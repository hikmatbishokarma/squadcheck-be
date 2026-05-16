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
exports.SquadsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const squad_schema_1 = require("../../database/schemas/squad.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
function toMidnight(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function defaultSquadContent(names) {
    return {
        squadName: `${names[0]}'s Crew`,
        vibe: 'Consistency over intensity.',
        challenge: 'Show up every weekday this week.',
        icebreaker: 'What time do you usually train?',
    };
}
let SquadsService = class SquadsService {
    constructor(squadModel, userModel) {
        this.squadModel = squadModel;
        this.userModel = userModel;
    }
    async getSuggestedSquads(gymId) {
        const gymOid = new mongoose_2.Types.ObjectId(gymId);
        const activeUsers = await this.userModel
            .find({ currentGymId: { $in: [gymId, gymOid] }, isOnline: true, lookingForSquad: true })
            .select('name fitnessGoal preferredTime fitnessLevel currentStreak streakCount avatar workoutFocus');
        if (activeUsers.length < 3)
            return [];
        const suggestions = [];
        const shuffled = [...activeUsers].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length; i += 4) {
            const group = shuffled.slice(i, i + 5);
            if (group.length < 3)
                break;
            const names = group.map((u) => u.name.split(' ')[0]);
            const content = defaultSquadContent(names);
            suggestions.push({ members: group, ...content, gymId });
        }
        return suggestions;
    }
    async formSquad(dto) {
        const members = await this.userModel
            .find({ _id: { $in: dto.memberIds } })
            .select('name');
        if (members.length !== dto.memberIds.length) {
            throw new common_1.BadRequestException('One or more users not found');
        }
        const names = members.map((u) => u.name.split(' ')[0]);
        const content = defaultSquadContent(names);
        const squad = await this.squadModel.create({
            squadName: content.squadName,
            gymId: dto.gymId,
            members: dto.memberIds,
            vibe: content.vibe,
            challenge: content.challenge,
            icebreaker: content.icebreaker,
            squadStreak: 1,
            lastSessionDate: new Date(),
            totalSessionsTogether: 1,
        });
        return this.squadModel
            .findById(squad._id)
            .populate('members', 'name avatar currentStreak streakCount');
    }
    async getActiveSquads(gymId) {
        return this.squadModel
            .find({ gymId, isActive: true, expiresAt: { $gt: new Date() } })
            .populate('members', 'name avatar currentStreak streakCount fitnessGoal workoutFocus');
    }
    async joinSquad(squadId, userId) {
        const squad = await this.squadModel.findById(squadId);
        if (!squad)
            throw new common_1.BadRequestException('Squad not found');
        if (squad.members.length >= 5)
            throw new common_1.BadRequestException('Squad is full');
        const updated = await this.squadModel
            .findByIdAndUpdate(squadId, { $addToSet: { members: userId } }, { new: true })
            .populate('members', 'name avatar currentStreak streakCount');
        await this.updateSquadStreak(squadId);
        return updated;
    }
    async leaveSquad(squadId, userId) {
        return this.squadModel
            .findByIdAndUpdate(squadId, { $pull: { members: userId } }, { new: true })
            .populate('members', 'name avatar currentStreak streakCount');
    }
    async updateSquadStreak(squadId) {
        const squad = await this.squadModel.findById(squadId);
        if (!squad)
            return { newStreak: 0, milestoneHit: false };
        const today = toMidnight(new Date());
        const lastSession = squad.lastSessionDate ? toMidnight(squad.lastSessionDate) : null;
        if (lastSession && lastSession.getTime() === today.getTime()) {
            return { newStreak: squad.squadStreak, milestoneHit: false };
        }
        let newStreak = squad.squadStreak;
        if (!lastSession) {
            newStreak = 1;
        }
        else {
            const dayDiff = Math.round((today.getTime() - lastSession.getTime()) / 86400000);
            const dayOfWeek = today.getDay();
            const maxAllowedGap = dayOfWeek === 1 ? 3 : 1;
            newStreak = dayDiff <= maxAllowedGap ? squad.squadStreak + 1 : 1;
        }
        const MILESTONES = [3, 7, 14, 21, 30];
        const milestoneHit = MILESTONES.includes(newStreak);
        await this.squadModel.findByIdAndUpdate(squadId, {
            squadStreak: newStreak,
            lastSessionDate: new Date(),
            $inc: { totalSessionsTogether: 1 },
        });
        return { newStreak, milestoneHit };
    }
};
exports.SquadsService = SquadsService;
exports.SquadsService = SquadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(squad_schema_1.Squad.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SquadsService);
//# sourceMappingURL=squads.service.js.map