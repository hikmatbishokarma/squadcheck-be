import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { LobbySession, LobbySessionDocument } from '../../database/schemas/lobby-session.schema';
import { AiService } from '../ai/ai.service';

export interface StreakResult {
  newStreak: number;
  isWeekend: boolean;
  isWeekendBonus: boolean;
  alreadyCheckedIn: boolean;
  milestoneHit: boolean;
}

function toMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function prevWeekdayBefore(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  return toMidnight(d);
}

const STREAK_MILESTONES = [7, 14, 21, 30, 42, 60, 90];

function computeStreak(user: UserDocument): StreakResult {
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

  let newStreak: number;

  if (!lastWeekday) {
    newStreak = 1;
  } else {
    const prevWd = prevWeekdayBefore(today);
    const lastWdMidnight = toMidnight(lastWeekday);

    if (lastWdMidnight.getTime() === prevWd.getTime()) {
      newStreak = (user.currentStreak ?? 0) + 1;
    } else {
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

@Injectable()
export class LobbyService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(LobbySession.name) private sessionModel: Model<LobbySessionDocument>,
    private aiService: AiService,
  ) {}

  async joinLobby(
    userId: string,
    gymId: string,
  ): Promise<{ users: UserDocument[]; streakResult: StreakResult; user: UserDocument }> {
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

    const updatePayload: Record<string, any> = {
      isOnline: true,
      currentGymId: gymId,
      $inc: { totalCheckins: 1 },
      checkinHours: updatedHours,
    };

    if (isWeekend) {
      updatePayload.$inc.weekendSessions = 1;
      const bonusName = dayOfWeek === 6 ? 'Saturday Discipline' : 'Sunday Session Bonus';
      updatePayload.$addToSet = { weekendBonuses: bonusName };
    } else if (!streakResult.alreadyCheckedIn) {
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
    return { users, streakResult, user: updatedUser! };
  }

  async leaveLobby(userId: string, gymId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user?.isOnline) return;

    // Find other users currently in gym to record as coTrainees
    const coTrainees = await this.userModel
      .find({ currentGymId: { $in: [gymId, new Types.ObjectId(gymId)] }, isOnline: true, _id: { $ne: new Types.ObjectId(userId) } })
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
      const durationMinutes = Math.round(
        (leftAt.getTime() - session.joinedAt.getTime()) / 60000,
      );
      await this.sessionModel.findByIdAndUpdate((session as any)._id, {
        leftAt,
        durationMinutes,
        coTrainees: coTrainees.map((u) => (u as any)._id),
        workoutFocus: user.workoutFocus,
      });
    }
  }

  async setWorkoutFocus(userId: string, focus: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { workoutFocus: focus },
      { new: true },
    );
  }

  async getActiveUsers(gymId: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ currentGymId: { $in: [gymId, new Types.ObjectId(gymId)] }, isOnline: true })
      .select(
        'name avatar currentStreak longestStreak weekendSessions fitnessGoal preferredTime fitnessLevel workoutFocus lookingForSquad streakCount',
      );
  }

  async getFamiliarFaces(
    userId: string,
    gymId: string,
  ): Promise<Array<{ user: UserDocument; overlapCount: number }>> {
    // Find sessions where this user was a coTrainee of others in this gym
    const userSessions = await this.sessionModel.find({
      userId,
      gymId,
      leftAt: { $ne: null },
    }).select('coTrainees');

    const overlapMap = new Map<string, number>();

    for (const session of userSessions) {
      for (const coId of session.coTrainees ?? []) {
        const key = coId.toString();
        overlapMap.set(key, (overlapMap.get(key) ?? 0) + 1);
      }
    }

    if (overlapMap.size === 0) return [];

    const sorted = [...overlapMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const users = await this.userModel
      .find({ _id: { $in: sorted.map(([id]) => id) } })
      .select('name avatar currentStreak workoutFocus streakCount');

    return sorted
      .map(([id, count]) => ({
        user: users.find((u) => (u as any)._id.toString() === id)!,
        overlapCount: count,
      }))
      .filter((x) => x.user != null);
  }

  async handleDisconnect(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (user?.isOnline && user.currentGymId) {
      await this.leaveLobby(userId, user.currentGymId.toString());
    }
  }

  async getInsights(gymId: string): Promise<{ energy: string; insights: string[] }> {
    const users = await this.userModel
      .find({ currentGymId: { $in: [gymId, new Types.ObjectId(gymId)] }, isOnline: true })
      .select('workoutFocus currentStreak streakCount preferredTime fitnessLevel');

    return this.aiService.generateGymInsights(
      users.map((u) => ({
        workoutFocus: u.workoutFocus,
        currentStreak: u.currentStreak ?? u.streakCount ?? 0,
        preferredTime: u.preferredTime,
        fitnessLevel: u.fitnessLevel,
      })),
    );
  }
}
