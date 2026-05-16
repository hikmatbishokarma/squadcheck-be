"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquadsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const squads_controller_1 = require("./squads.controller");
const squads_service_1 = require("./squads.service");
const squad_schema_1 = require("../../database/schemas/squad.schema");
const user_schema_1 = require("../../database/schemas/user.schema");
const auth_module_1 = require("../auth/auth.module");
let SquadsModule = class SquadsModule {
};
exports.SquadsModule = SquadsModule;
exports.SquadsModule = SquadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: squad_schema_1.Squad.name, schema: squad_schema_1.SquadSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [squads_controller_1.SquadsController],
        providers: [squads_service_1.SquadsService],
        exports: [squads_service_1.SquadsService],
    })
], SquadsModule);
//# sourceMappingURL=squads.module.js.map