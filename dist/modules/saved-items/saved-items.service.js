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
exports.SavedItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const saved_item_entity_1 = require("./entities/saved-item.entity");
const postals_service_1 = require("../postals/postals.service");
const VALID_ITEM_TYPES = ['street', 'postal'];
let SavedItemsService = class SavedItemsService {
    savedItemsRepository;
    postalsService;
    constructor(savedItemsRepository, postalsService) {
        this.savedItemsRepository = savedItemsRepository;
        this.postalsService = postalsService;
    }
    async save(type, itemId, userId) {
        const itemType = this.assertValidType(type);
        await this.assertItemExists(itemType, itemId);
        await this.savedItemsRepository
            .createQueryBuilder()
            .insert()
            .into(saved_item_entity_1.SavedItem)
            .values({ userId, itemType, itemId })
            .orIgnore()
            .execute();
        return { saved: true };
    }
    async unsave(type, itemId, userId) {
        const itemType = this.assertValidType(type);
        await this.assertItemExists(itemType, itemId);
        await this.savedItemsRepository.delete({ userId, itemType, itemId });
        return { saved: false };
    }
    async findMySaved(userId) {
        const items = await this.savedItemsRepository.find({ where: { userId } });
        return items.map((item) => ({ type: item.itemType, id: item.itemId }));
    }
    assertValidType(type) {
        if (!VALID_ITEM_TYPES.includes(type)) {
            throw new common_1.BadRequestException(`Invalid item_type "${type}": must be one of ${VALID_ITEM_TYPES.join(', ')}`);
        }
        return type;
    }
    async assertItemExists(itemType, itemId) {
        if (itemType !== 'postal')
            return;
        const exists = await this.postalsService.exists(itemId);
        if (!exists) {
            throw new common_1.NotFoundException(`Postal with id "${itemId}" not found`);
        }
    }
};
exports.SavedItemsService = SavedItemsService;
exports.SavedItemsService = SavedItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(saved_item_entity_1.SavedItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        postals_service_1.PostalsService])
], SavedItemsService);
//# sourceMappingURL=saved-items.service.js.map