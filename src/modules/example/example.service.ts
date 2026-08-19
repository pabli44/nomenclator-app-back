import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Example } from './entities/example.entity';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';

@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Example)
    private examplesRepository: Repository<Example>,
  ) {}

  findAll() {
    return this.examplesRepository.find();
  }

  findOne(id: string) {
    return this.examplesRepository.findOne({ where: { id } });
  }

  create(createExampleDto: CreateExampleDto) {
    const example = this.examplesRepository.create(createExampleDto);
    return this.examplesRepository.save(example);
  }

  async update(id: string, updateExampleDto: UpdateExampleDto) {
    await this.examplesRepository.update(id, updateExampleDto);
    return this.examplesRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    const result = await this.examplesRepository.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}
