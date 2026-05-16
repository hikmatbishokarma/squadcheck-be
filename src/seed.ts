import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gym } from './database/schemas/gym.schema';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const branches = [
  {
    tenantId: 'cultfit',
    tenantName: 'cult.fit',
    branchId: 'himayathnagar',
    branchName: 'Himayathnagar',
    gymName: 'cult.fit',
    city: 'Hyderabad',
    address: 'Basirabad, Himayathnagar, Hyderabad',
  },
  {
    tenantId: 'cultfit',
    tenantName: 'cult.fit',
    branchId: 'banjara-hills',
    branchName: 'Banjara Hills',
    gymName: 'cult.fit',
    city: 'Hyderabad',
    address: 'Road No. 2, Banjara Hills, Hyderabad',
  },
  {
    tenantId: 'fitlife',
    tenantName: 'FitLife',
    branchId: 'koramangala',
    branchName: 'Koramangala',
    gymName: 'FitLife',
    city: 'Bangalore',
    address: 'Koramangala, Bangalore',
  },
  {
    tenantId: 'irontemple',
    tenantName: 'Iron Temple',
    branchId: 'andheri',
    branchName: 'Andheri West',
    gymName: 'Iron Temple',
    city: 'Mumbai',
    address: 'Andheri West, Mumbai',
  },
  {
    tenantId: 'crossfit',
    tenantName: 'CrossFit',
    branchId: 'connaught-place',
    branchName: 'Connaught Place',
    gymName: 'CrossFit',
    city: 'Delhi',
    address: 'Connaught Place, New Delhi',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const gymModel = app.get<Model<any>>(getModelToken(Gym.name));

  await gymModel.deleteMany({});
  const gyms = await gymModel.insertMany(branches);

  console.log('\n\x1b[33m===========================================');
  console.log('  🏋️  SquadCheck Gym Branches Seeded');
  console.log('===========================================\x1b[0m\n');

  gyms.forEach((gym: any, i: number) => {
    const joinUrl = `${BASE_URL}/join/${gym.branchId}`;
    const qrPayload = JSON.stringify({
      tenantId: gym.tenantId,
      branchId: gym.branchId,
      gymName: gym.gymName,
      branchName: gym.branchName,
    });

    console.log(`\x1b[36m${gym.tenantName} — ${gym.branchName}\x1b[0m`);
    console.log(`  MongoDB _id : ${gym._id}`);
    console.log(`  Join URL    : \x1b[32m${joinUrl}\x1b[0m`);
    console.log(`  QR Payload  : ${qrPayload}`);
    if (i < gyms.length - 1) console.log('');
  });

  console.log('\n\x1b[33m===========================================');
  console.log('  Point your QR codes at the Join URLs above.');
  console.log('  Or open them directly in a browser to test.');
  console.log('===========================================\x1b[0m\n');

  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
