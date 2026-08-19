import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postal } from './entities/postal.entity';

@Injectable()
export class PostalsService {
  constructor(
    @InjectRepository(Postal)
    private readonly postalsRepository: Repository<Postal>,
  ) {}

  findAll() {
    return this.postalsRepository.find();
  }

  async findOne(id: string): Promise<Postal> {
    const postal = await this.postalsRepository.findOne({ where: { id } });
    if (!postal) {
      throw new NotFoundException(`Postal with id "${id}" not found`);
    }
    return postal;
  }

  exists(id: string): Promise<boolean> {
    return this.postalsRepository.exists({ where: { id } });
  }
}
