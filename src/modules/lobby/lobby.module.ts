import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { LobbySession, LobbySessionSchema } from '../../database/schemas/lobby-session.schema';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: LobbySession.name, schema: LobbySessionSchema },
    ]),
    AuthModule,
    AiModule,
  ],
  controllers: [LobbyController],
  providers: [LobbyService],
  exports: [LobbyService],
})
export class LobbyModule {}
