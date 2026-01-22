import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getActivityLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.adminService.getActivityLogs(limitNum);
  }
}

