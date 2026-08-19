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
exports.LikesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const like_entity_1 = require("./entities/like.entity");
const postals_service_1 = require("../postals/postals.service");
let LikesService = class LikesService {
    likesRepository;
    postalsService;
    constructor(likesRepository, postalsService) {
        this.likesRepository = likesRepository;
        this.postalsService = postalsService;
    }
    async like(postalId, userId) {
        await this.assertPostalExists(postalId);
        await this.likesRepository
            .createQueryBuilder()
            .insert()
            .into(like_entity_1.Like)
            .values({ userId, postalId })
            .orIgnore()
            .execute();
        return { liked: true };
    }
    async unlike(postalId, userId) {
        await this.assertPostalExists(postalId);
        await this.likesRepository.delete({ userId, postalId });
        return { liked: false };
    }
    async findLikedPostalIds(userId) {
        const likes = await this.likesRepository.find({ where: { userId } });
        return likes.map((like) => like.postalId);
    }
    async assertPostalExists(postalId) {
        const exists = await this.postalsService.exists(postalId);
        if (!exists) {
            throw new common_1.NotFoundException(`Postal with id "${postalId}" not found`);
        }
    }
};
exports.LikesService = LikesService;
exports.LikesService = LikesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(like_entity_1.Like)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        postals_service_1.PostalsService])
], LikesService);
//# sourceMappingURL=likes.service.js.map