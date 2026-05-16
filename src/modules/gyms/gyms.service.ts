import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Gym, GymDocument } from '../../database/schemas/gym.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { CreateGymDto } from './dto/create-gym.dto';

@Injectable()
export class GymsService {
  constructor(
    @InjectModel(Gym.name) private gymModel: Model<GymDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<GymDocument[]> {
    return this.gymModel.find().sort({ activeUsersCount: -1, gymName: 1 });
  }

  async findById(id: string): Promise<GymDocument> {
    const gym = await this.gymModel.findById(id);
    if (!gym) throw new NotFoundException('Gym not found');
    return gym;
  }

  async findByBranchId(branchId: string): Promise<GymDocument> {
    const gym = await this.gymModel.findOne({ branchId });
    if (!gym) throw new NotFoundException('Gym branch not found');
    return gym;
  }

  async create(dto: CreateGymDto): Promise<GymDocument> {
    return this.gymModel.create(dto);
  }

  async getActiveUsers(gymId: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ currentGymId: { $in: [gymId, new Types.ObjectId(gymId)] }, isOnline: true })
      .select('name avatar currentStreak streakCount longestStreak fitnessGoal preferredTime fitnessLevel workoutFocus lookingForSquad');
  }
}
