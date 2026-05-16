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
exports.GymsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const gym_schema_1 = require("../../database/schemas/gym.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
let GymsService = class GymsService {
    constructor(gymModel, userModel) {
        this.gymModel = gymModel;
        this.userModel = userModel;
    }
    async findAll() {
        return this.gymModel.find().sort({ activeUsersCount: -1, gymName: 1 });
    }
    async findById(id) {
        const gym = await this.gymModel.findById(id);
        if (!gym)
            throw new common_1.NotFoundException('Gym not found');
        return gym;
    }
    async findByBranchId(branchId) {
        const gym = await this.gymModel.findOne({ branchId });
        if (!gym)
            throw new common_1.NotFoundException('Gym branch not found');
        return gym;
    }
    async create(dto) {
        return this.gymModel.create(dto);
    }
    async getActiveUsers(gymId) {
        return this.userModel
            .find({ currentGymId: { $in: [gymId, new mongoose_2.Types.ObjectId(gymId)] }, isOnline: true })
            .select('name avatar currentStreak streakCount longestStreak fitnessGoal preferredTime fitnessLevel workoutFocus lookingForSquad');
    }
};
exports.GymsService = GymsService;
exports.GymsService = GymsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(gym_schema_1.Gym.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], GymsService);
//# sourceMappingURL=gyms.service.js.map