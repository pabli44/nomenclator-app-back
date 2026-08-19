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
exports.PostalsController = void 0;
const common_1 = require("@nestjs/common");
const postals_service_1 = require("./postals.service");
const response_interceptor_1 = require("../../common/interceptors/response.interceptor");
const swagger_1 = require("@nestjs/swagger");
let PostalsController = class PostalsController {
    postalsService;
    constructor(postalsService) {
        this.postalsService = postalsService;
    }
    findAll() {
        return this.postalsService.findAll();
    }
    findOne(id) {
        return this.postalsService.findOne(id);
    }
};
exports.PostalsController = PostalsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List the postal catalog (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PostalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one postal by id (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PostalsController.prototype, "findOne", null);
exports.PostalsController = PostalsController = __decorate([
    (0, common_1.Controller)('postals'),
    (0, swagger_1.ApiTags)('postals'),
    (0, common_1.UseInterceptors)(response_interceptor_1.ResponseInterceptor),
    __metadata("design:paramtypes", [postals_service_1.PostalsService])
], PostalsController);
//# sourceMappingURL=postals.controller.js.map