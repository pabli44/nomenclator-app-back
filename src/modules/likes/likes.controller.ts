import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@ApiTags('likes')
@UseInterceptors(ResponseInterceptor)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Put('postals/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a postal (idempotent)' })
  like(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.likesService.like(id, req.user.id);
  }

  @Delete('postals/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a postal (idempotent)' })
  unlike(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.likesService.unlike(id, req.user.id);
  }

  @Get('me/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the postal ids liked by the current user' })
  findLikedPostalIds(@Request() req: { user: { id: string } }) {
    return this.likesService.findLikedPostalIds(req.user.id);
  }
}
