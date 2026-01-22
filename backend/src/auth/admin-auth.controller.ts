import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '../entities/user.entity';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    const result = await this.authService.signIn(signInDto);
    
    // Verify user is admin or manager
    if (result.user.role !== UserRole.ADMIN && result.user.role !== UserRole.MANAGER) {
      throw new Error('Access denied. Admin access required.');
    }

    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.authService.validateUser(req.user.id);
    
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
      throw new Error('Access denied. Admin access required.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

