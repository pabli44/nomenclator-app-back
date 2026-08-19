import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { PostalsModule } from '../postals/postals.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), PostalsModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
