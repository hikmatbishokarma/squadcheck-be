import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SquadsController } from './squads.controller';
import { SquadsService } from './squads.service';
import { Squad, SquadSchema } from '../../database/schemas/squad.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Squad.name, schema: SquadSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [SquadsController],
  providers: [SquadsService],
  exports: [SquadsService],
})
export class SquadsModule {}
