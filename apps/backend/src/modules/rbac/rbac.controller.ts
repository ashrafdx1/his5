import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Role-Based Access Control')
@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Retrieve all roles in the system (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of system roles retrieved successfully.' })
  async getRoles() {
    return this.rbacService.getRoles();
  }

  @Get('roles/:role/permissions')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Retrieve permissions for a specific role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async getPermissions(@Param('role') role: string) {
    return this.rbacService.getPermissionsForRole(role);
  }
}
