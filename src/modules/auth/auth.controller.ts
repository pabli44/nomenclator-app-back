import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuestDto } from './dto/guest.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @UseInterceptors(ResponseInterceptor)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { id: user.id, email: user.email };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('guest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register or reuse a guest user (find-or-create by device UUID)',
  })
  @UseInterceptors(ResponseInterceptor)
  async registerGuest(@Body() guestDto: GuestDto) {
    return this.authService.registerGuest(guestDto.deviceId);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: { user: { id: string; email: string } }) {
    return req.user;
  }
}
