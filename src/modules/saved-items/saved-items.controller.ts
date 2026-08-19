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
import { SavedItemsService } from './saved-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@ApiTags('saved-items')
@UseInterceptors(ResponseInterceptor)
export class SavedItemsController {
  constructor(private readonly savedItemsService: SavedItemsService) {}

  @Put('items/:type/:id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save an item by type and id (idempotent)' })
  save(
    @Param('type') type: string,
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.savedItemsService.save(type, id, req.user.id);
  }

  @Delete('items/:type/:id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsave an item by type and id (idempotent)' })
  unsave(
    @Param('type') type: string,
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.savedItemsService.unsave(type, id, req.user.id);
  }

  @Get('me/saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the saved items of the current user' })
  findMySaved(@Request() req: { user: { id: string } }) {
    return this.savedItemsService.findMySaved(req.user.id);
  }
}