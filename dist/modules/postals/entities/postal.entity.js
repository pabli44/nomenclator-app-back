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
exports.Postal = void 0;
exports.toNumber = toNumber;
const typeorm_1 = require("typeorm");
function toNumber(value) {
    if (value === null || value === undefined)
        return value;
    return Number(value);
}
class NumericTransformer {
    to(value) {
        return value;
    }
    from(value) {
        return toNumber(value);
    }
}
let Postal = class Postal {
    id;
    name;
    description;
    price;
    category;
    imageUrl;
};
exports.Postal = Postal;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Postal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Postal.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Postal.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new NumericTransformer(),
    }),
    __metadata("design:type", Number)
], Postal.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Postal.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Postal.prototype, "imageUrl", void 0);
exports.Postal = Postal = __decorate([
    (0, typeorm_1.Entity)('postals')
], Postal);
//# sourceMappingURL=postal.entity.js.map