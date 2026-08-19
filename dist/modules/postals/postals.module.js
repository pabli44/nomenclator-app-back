"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostalsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const postal_entity_1 = require("./entities/postal.entity");
const postals_controller_1 = require("./postals.controller");
const postals_service_1 = require("./postals.service");
let PostalsModule = class PostalsModule {
};
exports.PostalsModule = PostalsModule;
exports.PostalsModule = PostalsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([postal_entity_1.Postal])],
        controllers: [postals_controller_1.PostalsController],
        providers: [postals_service_1.PostalsService],
        exports: [postals_service_1.PostalsService],
    })
], PostalsModule);
//# sourceMappingURL=postals.module.js.map