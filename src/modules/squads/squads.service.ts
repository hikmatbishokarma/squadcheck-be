import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Squad, SquadDocument } from '../../database/schemas/squad.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { CreateSquadDto } from './dto/create-squad.dto';

function toMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function defaultSquadContent(names: string[]): { squadName: string; vibe: string; challenge: string; icebreaker: string } {
  return {
    squadName: `${names[0]}'s Crew`,
    vibe: 'Consistency over intensity.',
    challenge: 'Show up every weekday this week.',
    icebreaker: 'What time do you usually train?',
  };
}

@Injectable()
export class SquadsService {
  constructor(
    @InjectModel(Squad.name) private squadModel: Model<SquadDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getSuggestedSquads(gymId: string): Promise<any[]> {
    const gymOid = new Types.ObjectId(gymId);
    const activeUsers = await this.userModel
      .find({ currentGymId: { $in: [gymId, gymOid] }, isOnline: true, lookingForSquad: true })
      .select('name fitnessGoal preferredTime fitnessLevel currentStreak streakCount avatar workoutFocus');

    if (activeUsers.length < 3) return [];

    const suggestions = [];
    const shuffled = [...activeUsers].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i += 4) {
      const group = shuffled.slice(i, i + 5);
      if (group.length < 3) break;

      const names = group.map((u) => u.name.split(' ')[0]);
      const content = defaultSquadContent(names);
      suggestions.push({ members: group, ...content, gymId });
    }

    return suggestions;
  }

  async formSquad(dto: CreateSquadDto): Promise<SquadDocument> {
    const members = await this.userModel
      .find({ _id: { $in: dto.memberIds } })
      .select('name');

    if (members.length !== dto.memberIds.length) {
      throw new BadRequestException('One or more users not found');
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
      .findById((squad as any)._id)
      .populate('members', 'name avatar currentStreak streakCount');
  }

  async getActiveSquads(gymId: string): Promise<SquadDocument[]> {
    return this.squadModel
      .find({ gymId, isActive: true, expiresAt: { $gt: new Date() } })
      .populate('members', 'name avatar currentStreak streakCount fitnessGoal workoutFocus');
  }

  async joinSquad(squadId: string, userId: string): Promise<SquadDocument> {
    const squad = await this.squadModel.findById(squadId);
    if (!squad) throw new BadRequestException('Squad not found');
    if (squad.members.length >= 5) throw new BadRequestException('Squad is full');

    const updated = await this.squadModel
      .findByIdAndUpdate(squadId, { $addToSet: { members: userId } }, { new: true })
      .populate('members', 'name avatar currentStreak streakCount');

    await this.updateSquadStreak(squadId);
    return updated;
  }

  async leaveSquad(squadId: string, userId: string): Promise<SquadDocument> {
    return this.squadModel
      .findByIdAndUpdate(squadId, { $pull: { members: userId } }, { new: true })
      .populate('members', 'name avatar currentStreak streakCount');
  }

  async updateSquadStreak(squadId: string): Promise<{ newStreak: number; milestoneHit: boolean }> {
    const squad = await this.squadModel.findById(squadId);
    if (!squad) return { newStreak: 0, milestoneHit: false };

    const today = toMidnight(new Date());
    const lastSession = squad.lastSessionDate ? toMidnight(squad.lastSessionDate) : null;

    if (lastSession && lastSession.getTime() === today.getTime()) {
      return { newStreak: squad.squadStreak, milestoneHit: false };
    }

    let newStreak = squad.squadStreak;

    if (!lastSession) {
      newStreak = 1;
    } else {
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
}
