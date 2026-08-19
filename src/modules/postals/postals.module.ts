import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postal } from './entities/postal.entity';
import { PostalsController } from './postals.controller';
import { PostalsService } from './postals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Postal])],
  controllers: [PostalsController],
  providers: [PostalsService],
  exports: [PostalsService],
})
export class PostalsModule {}
