import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export type SavedItemType = 'street' | 'postal';

@Entity('saved_items')
@Unique('UQ_saved_items_user_type_item', ['userId', 'itemType', 'itemId'])
export class SavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: ['street', 'postal'],
  })
  itemType: SavedItemType;

  @Column({ name: 'item_id', type: 'varchar' })
  itemId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}