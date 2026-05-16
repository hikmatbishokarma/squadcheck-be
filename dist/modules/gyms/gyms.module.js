"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const gyms_controller_1 = require("./gyms.controller");
const gyms_service_1 = require("./gyms.service");
const gym_schema_1 = require("../../database/schemas/gym.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
const auth_module_1 = require("../auth/auth.module");
let GymsModule = class GymsModule {
};
exports.GymsModule = GymsModule;
exports.GymsModule = GymsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: gym_schema_1.Gym.name, schema: gym_schema_1.GymSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [gyms_controller_1.GymsController],
        providers: [gyms_service_1.GymsService],
        exports: [gyms_service_1.GymsService],
    })
], GymsModule);
//# sourceMappingURL=gyms.module.js.map