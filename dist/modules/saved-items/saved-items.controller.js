"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedItemsController = void 0;
const common_1 = require("@nestjs/common");
const saved_items_service_1 = require("./saved-items.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const response_interceptor_1 = require("../../common/interceptors/response.interceptor");
const swagger_1 = require("@nestjs/swagger");
let SavedItemsController = class SavedItemsController {
    savedItemsService;
    constructor(savedItemsService) {
        this.savedItemsService = savedItemsService;
    }
    save(type, id, req) {
        return this.savedItemsService.save(type, id, req.user.id);
    }
    unsave(type, id, req) {
        return this.savedItemsService.unsave(type, id, req.user.id);
    }
    findMySaved(req) {
        return this.savedItemsService.findMySaved(req.user.id);
    }
};
exports.SavedItemsController = SavedItemsController;
__decorate([
    (0, common_1.Put)('items/:type/:id/save'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Save an item by type and id (idempotent)' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SavedItemsController.prototype, "save", null);
__decorate([
    (0, common_1.Delete)('items/:type/:id/save'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unsave an item by type and id (idempotent)' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SavedItemsController.prototype, "unsave", null);
__decorate([
    (0, common_1.Get)('me/saved'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get the saved items of the current user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SavedItemsController.prototype, "findMySaved", null);
exports.SavedItemsController = SavedItemsController = __decorate([
    (0, common_1.Controller)(),
    (0, swagger_1.ApiTags)('saved-items'),
    (0, common_1.UseInterceptors)(response_interceptor_1.ResponseInterceptor),
    __metadata("design:paramtypes", [saved_items_service_1.SavedItemsService])
], SavedItemsController);
//# sourceMappingURL=saved-items.controller.js.map