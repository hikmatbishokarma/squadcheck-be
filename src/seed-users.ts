/**
 * Seed 5 test users and mark them all active in the first available gym.
 * Run:  npm run seed:users
 *
 * What it does:
 *  1. Finds the first gym in DB (run `npm run seed` first if none exist)
 *  2. Upserts 5 realistic test users (safe to re-run)
 *  3. Marks every user as online in that gym with a live lobby session
 *  4. Gives each user a varied streak / focus / fitness level so AI squad
 *     suggestions produce interesting results
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Gym } from './database/schemas/gym.schema';
import { User } from './database/schemas/user.schema';
import { LobbySession } from './database/schemas/lobby-session.schema';

// ─── Test users ──────────────────────────────────────────────────────────────

const TEST_USERS = [
  {
    name: 'Arjun Sharma',
    email: 'arjun.test@squadcheck.dev',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=f97316&fontColor=ffffff',
    fitnessLevel: 'Intermediate',
    fitnessGoal: 'Muscle Gain',
    workoutStyle: 'Strength',
    preferredTime: 'Morning',
    workoutFocus: 'Legs',
    currentStreak: 12,
    longestStreak: 14,
    totalCheckins: 38,
    lookingForSquad: true,
    onboardingCompleted: true,
  },
  {
    name: 'Priya Patel',
    email: 'priya.test@squadcheck.dev',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PP&backgroundColor=a855f7&fontColor=ffffff',
    fitnessLevel: 'Beginner',
    fitnessGoal: 'Consistency',
    workoutStyle: 'Cardio',
    preferredTime: 'Morning',
    workoutFocus: 'Cardio',
    currentStreak: 7,
    longestStreak: 7,
    totalCheckins: 14,
    lookingForSquad: true,
    onboardingCompleted: true,
  },
  {
    name: 'Rahul Kumar',
    email: 'rahul.test@squadcheck.dev',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RK&backgroundColor=3b82f6&fontColor=ffffff',
    fitnessLevel: 'Advanced',
    fitnessGoal: 'Muscle Gain',
    workoutStyle: 'Strength',
    preferredTime: 'Morning',
    workoutFocus: 'Chest',
    currentStreak: 21,
    longestStreak: 30,
    totalCheckins: 87,
    lookingForSquad: false,
    onboardingCompleted: true,
  },
  {
    name: 'Neha Singh',
    email: 'neha.test@squadcheck.dev',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NS&backgroundColor=10b981&fontColor=ffffff',
    fitnessLevel: 'Intermediate',
    fitnessGoal: 'Weight Loss',
    workoutStyle: 'HIIT',
    preferredTime: 'Evening',
    workoutFocus: 'Full Body',
    currentStreak: 5,
    longestStreak: 9,
    totalCheckins: 22,
    lookingForSquad: true,
    onboardingCompleted: true,
  },
  {
    name: 'Vikram Nair',
    email: 'vikram.test@squadcheck.dev',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=VN&backgroundColor=ef4444&fontColor=ffffff',
    fitnessLevel: 'Beginner',
    fitnessGoal: 'General Fitness',
    workoutStyle: 'Mixed',
    preferredTime: 'Morning',
    workoutFocus: 'Back',
    currentStreak: 3,
    longestStreak: 5,
    totalCheckins: 9,
    lookingForSquad: true,
    onboardingCompleted: true,
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seedUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const gymModel = app.get<Model<any>>(getModelToken(Gym.name));
  const userModel = app.get<Model<any>>(getModelToken(User.name));
  const sessionModel = app.get<Model<any>>(getModelToken(LobbySession.name));

  // 1. Pick a gym — prefer the real user's homeGymId, then himayathnagar, else first available.
  const realUser = await userModel.findOne({
    email: { $nin: TEST_USERS.map((u) => u.email) },
    homeGymId: { $exists: true, $ne: null },
  });

  let gym =
    realUser?.homeGymId ? await gymModel.findById(realUser.homeGymId) : null;
  if (!gym) gym = await gymModel.findOne({ branchId: 'himayathnagar' });
  if (!gym) gym = await gymModel.findOne({});
  if (!gym) {
    console.error('\n❌  No gyms found. Run `npm run seed` first.\n');
    await app.close();
    process.exit(1);
  }

  if (realUser?.homeGymId) {
    console.log(`\n\x1b[36mUsing gym from real user (${realUser.name}): ${gym.gymName} — ${gym.branchName ?? gym.city}\x1b[0m`);
  } else {
    console.log(`\n\x1b[36mUsing gym: ${gym.gymName} — ${gym.branchName ?? gym.city}\x1b[0m`);
  }
  console.log(`  _id: ${gym._id}\n`);

  const gymId = gym._id as Types.ObjectId;
  const now = new Date();

  // 2. Mark any previously seeded test users offline so we start clean.
  await userModel.updateMany(
    { email: { $in: TEST_USERS.map((u) => u.email) } },
    { $set: { isOnline: false, currentGymId: null } },
  );

  // 3. Close any open lobby sessions for them.
  const existingUsers = await userModel.find({
    email: { $in: TEST_USERS.map((u) => u.email) },
  });
  if (existingUsers.length) {
    await sessionModel.updateMany(
      { userId: { $in: existingUsers.map((u) => u._id) }, leftAt: null },
      { $set: { leftAt: now, durationMinutes: 0 } },
    );
  }

  // 4. Upsert users and create fresh lobby sessions.
  const seededUsers: any[] = [];

  for (const data of TEST_USERS) {
    const user = await userModel.findOneAndUpdate(
      { email: data.email },
      {
        $set: {
          ...data,
          isOnline: true,
          currentGymId: gymId,
          homeGymId: gymId,
          streakCount: data.currentStreak,
          lastWeekdayCheckinDate: now,
          checkinHours: [now.getHours()],
        },
      },
      { upsert: true, new: true },
    );

    const dayOfWeek = now.getDay();
    await sessionModel.create({
      userId: user._id,
      gymId,
      joinedAt: now,
      workoutFocus: data.workoutFocus,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });

    seededUsers.push(user);
    console.log(`\x1b[32m✓\x1b[0m  ${data.name} — ${data.workoutFocus} | streak ${data.currentStreak} | ${data.fitnessLevel}`);
  }

  // 5. Cross-link coTrainees on past sessions so FamiliarFaces works.
  const userIds = seededUsers.map((u) => u._id);
  for (const userId of userIds) {
    const coTrainees = userIds.filter((id) => !id.equals(userId));
    // Create one historical session with coTrainees so familiar faces populate.
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await sessionModel.create({
      userId,
      gymId,
      joinedAt: yesterday,
      leftAt: new Date(yesterday.getTime() + 60 * 60 * 1000),
      durationMinutes: 60,
      workoutFocus: 'Full Body',
      dayOfWeek: yesterday.getDay(),
      isWeekend: yesterday.getDay() === 0 || yesterday.getDay() === 6,
      coTrainees,
    });
  }

  console.log(`
\x1b[33m===========================================
  5 test users are now ACTIVE in:
  ${gym.gymName}${gym.branchName ? ' — ' + gym.branchName : ''}
===========================================\x1b[0m

  Open the lobby to see them:
  \x1b[32mhttp://localhost:3000/lobby/${gym._id}\x1b[0m

  3+ users active → squad suggestions will fire automatically.
`);

  await app.close();
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
