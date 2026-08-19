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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedItem = void 0;
const typeorm_1 = require("typeorm");
let SavedItem = class SavedItem {
    id;
    userId;
    itemType;
    itemId;
    createdAt;
};
exports.SavedItem = SavedItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SavedItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], SavedItem.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'item_type',
        type: 'enum',
        enum: ['street', 'postal'],
    }),
    __metadata("design:type", String)
], SavedItem.prototype, "itemType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_id', type: 'varchar' }),
    __metadata("design:type", String)
], SavedItem.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SavedItem.prototype, "createdAt", void 0);
exports.SavedItem = SavedItem = __decorate([
    (0, typeorm_1.Entity)('saved_items'),
    (0, typeorm_1.Unique)('UQ_saved_items_user_type_item', ['userId', 'itemType', 'itemId'])
], SavedItem);
//# sourceMappingURL=saved-item.entity.js.map