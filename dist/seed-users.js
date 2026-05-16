"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const mongoose_1 = require("@nestjs/mongoose");
const gym_schema_1 = require("./database/schemas/gym.schema");
const user_schema_1 = require("./database/schemas/user.schema");
const lobby_session_schema_1 = require("./database/schemas/lobby-session.schema");
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
async function seedUsers() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const gymModel = app.get((0, mongoose_1.getModelToken)(gym_schema_1.Gym.name));
    const userModel = app.get((0, mongoose_1.getModelToken)(user_schema_1.User.name));
    const sessionModel = app.get((0, mongoose_1.getModelToken)(lobby_session_schema_1.LobbySession.name));
    const realUser = await userModel.findOne({
        email: { $nin: TEST_USERS.map((u) => u.email) },
        homeGymId: { $exists: true, $ne: null },
    });
    let gym = realUser?.homeGymId ? await gymModel.findById(realUser.homeGymId) : null;
    if (!gym)
        gym = await gymModel.findOne({ branchId: 'himayathnagar' });
    if (!gym)
        gym = await gymModel.findOne({});
    if (!gym) {
        console.error('\n❌  No gyms found. Run `npm run seed` first.\n');
        await app.close();
        process.exit(1);
    }
    if (realUser?.homeGymId) {
        console.log(`\n\x1b[36mUsing gym from real user (${realUser.name}): ${gym.gymName} — ${gym.branchName ?? gym.city}\x1b[0m`);
    }
    else {
        console.log(`\n\x1b[36mUsing gym: ${gym.gymName} — ${gym.branchName ?? gym.city}\x1b[0m`);
    }
    console.log(`  _id: ${gym._id}\n`);
    const gymId = gym._id;
    const now = new Date();
    await userModel.updateMany({ email: { $in: TEST_USERS.map((u) => u.email) } }, { $set: { isOnline: false, currentGymId: null } });
    const existingUsers = await userModel.find({
        email: { $in: TEST_USERS.map((u) => u.email) },
    });
    if (existingUsers.length) {
        await sessionModel.updateMany({ userId: { $in: existingUsers.map((u) => u._id) }, leftAt: null }, { $set: { leftAt: now, durationMinutes: 0 } });
    }
    const seededUsers = [];
    for (const data of TEST_USERS) {
        const user = await userModel.findOneAndUpdate({ email: data.email }, {
            $set: {
                ...data,
                isOnline: true,
                currentGymId: gymId,
                homeGymId: gymId,
                streakCount: data.currentStreak,
                lastWeekdayCheckinDate: now,
                checkinHours: [now.getHours()],
            },
        }, { upsert: true, new: true });
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
    const userIds = seededUsers.map((u) => u._id);
    for (const userId of userIds) {
        const coTrainees = userIds.filter((id) => !id.equals(userId));
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
//# sourceMappingURL=seed-users.js.map