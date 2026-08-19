import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { PostalsService } from './postals.service';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('postals')
@ApiTags('postals')
@UseInterceptors(ResponseInterceptor)
export class PostalsController {
  constructor(private readonly postalsService: PostalsService) {}

  @Get()
  @ApiOperation({ summary: 'List the postal catalog (public)' })
  findAll() {
    return this.postalsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one postal by id (public)' })
  findOne(@Param('id') id: string) {
    return this.postalsService.findOne(id);
  }
}
