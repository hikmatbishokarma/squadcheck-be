import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';
import { Gym, GymSchema } from '../../database/schemas/gym.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Gym.name, schema: GymSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [GymsController],
  providers: [GymsService],
  exports: [GymsService],
})
export class GymsModule {}
