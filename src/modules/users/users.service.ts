import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('currentGymId');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        fitnessGoal: dto.fitnessGoal,
        preferredTime: dto.preferredTime,
        lookingForSquad: dto.lookingForSquad,
        workoutStyle: dto.workoutStyle,
        fitnessLevel: dto.fitnessLevel,
        onboardingCompleted: true,
      },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, dto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setHomeGym(userId: string, gymId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { homeGymId: gymId },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
