"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const configuration_1 = require("./config/configuration");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const gyms_module_1 = require("./modules/gyms/gyms.module");
const lobby_module_1 = require("./modules/lobby/lobby.module");
const squads_module_1 = require("./modules/squads/squads.module");
const ai_module_1 = require("./modules/ai/ai.module");
const health_module_1 = require("./modules/health/health.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const lobby_gateway_1 = require("./gateway/lobby.gateway");
const user_schema_1 = require("./database/schemas/user.schema");
const lobby_session_schema_1 = require("./database/schemas/lobby-session.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [configuration_1.default] }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    uri: configService.get('mongoUri'),
                }),
                inject: [config_1.ConfigService],
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('jwtSecret'),
                    signOptions: { expiresIn: '30d' },
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: lobby_session_schema_1.LobbySession.name, schema: lobby_session_schema_1.LobbySessionSchema },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            gyms_module_1.GymsModule,
            lobby_module_1.LobbyModule,
            squads_module_1.SquadsModule,
            ai_module_1.AiModule,
            health_module_1.HealthModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [lobby_gateway_1.LobbyGateway],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map