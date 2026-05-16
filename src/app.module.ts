import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GymsModule } from './modules/gyms/gyms.module';
import { LobbyModule } from './modules/lobby/lobby.module';
import { SquadsModule } from './modules/squads/squads.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { LobbyGateway } from './gateway/lobby.gateway';
import { User, UserSchema } from './database/schemas/user.schema';
import { LobbySession, LobbySessionSchema } from './database/schemas/lobby-session.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: LobbySession.name, schema: LobbySessionSchema },
    ]),
    AuthModule,
    UsersModule,
    GymsModule,
    LobbyModule,
    SquadsModule,
    AiModule,
    HealthModule,
    NotificationsModule,
  ],
  providers: [LobbyGateway],
})
export class AppModule {}
