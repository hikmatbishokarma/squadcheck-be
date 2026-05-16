"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const lobby_controller_1 = require("./lobby.controller");
const lobby_service_1 = require("./lobby.service");
const user_schema_1 = require("../../database/schemas/user.schema");
const lobby_session_schema_1 = require("../../database/schemas/lobby-session.schema");
const auth_module_1 = require("../auth/auth.module");
const ai_module_1 = require("../ai/ai.module");
let LobbyModule = class LobbyModule {
};
exports.LobbyModule = LobbyModule;
exports.LobbyModule = LobbyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: lobby_session_schema_1.LobbySession.name, schema: lobby_session_schema_1.LobbySessionSchema },
            ]),
            auth_module_1.AuthModule,
            ai_module_1.AiModule,
        ],
        controllers: [lobby_controller_1.LobbyController],
        providers: [lobby_service_1.LobbyService],
        exports: [lobby_service_1.LobbyService],
    })
], LobbyModule);
//# sourceMappingURL=lobby.module.js.map