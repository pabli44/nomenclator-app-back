import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedItem } from './entities/saved-item.entity';
import { SavedItemsController } from './saved-items.controller';
import { SavedItemsService } from './saved-items.service';
import { PostalsModule } from '../postals/postals.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedItem]), PostalsModule],
  controllers: [SavedItemsController],
  providers: [SavedItemsService],
})
export class SavedItemsModule {}