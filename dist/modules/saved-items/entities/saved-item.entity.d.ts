export type SavedItemType = 'street' | 'postal';
export declare class SavedItem {
    id: string;
    userId: string;
    itemType: SavedItemType;
    itemId: string;
    createdAt: Date;
}
