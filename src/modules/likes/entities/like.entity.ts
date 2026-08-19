import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('likes')
@Unique('UQ_likes_user_postal', ['userId', 'postalId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @Column({ name: 'postalId', type: 'varchar' })
  postalId: string;

  @CreateDateColumn()
  createdAt: Date;
}
