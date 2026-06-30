import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ManagementService, HospitalConfig } from './management.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Management')
@Controller('management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Get('config')
  @ApiOperation({ summary: 'Retrieve hospital metadata configurations' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully.' })
  async getConfig() {
    return this.managementService.getConfig();
  }

  @Post('config')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update hospital configurations (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully.' })
  async updateConfig(@Body() newConfig: Partial<HospitalConfig>) {
    return this.managementService.updateConfig(newConfig);
  }
}
