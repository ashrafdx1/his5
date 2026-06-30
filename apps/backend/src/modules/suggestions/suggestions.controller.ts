import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Suggestions')
@Controller('suggestions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a feedback suggestion' })
  @ApiResponse({ status: 201, description: 'Suggestion successfully created.' })
  async create(@Req() req: any, @Body() body: { title: string; content: string }) {
    return this.suggestionsService.create(req.user.userId, body);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List all suggestions (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'List of suggestions retrieved.' })
  async findAll() {
    return this.suggestionsService.findAll();
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update suggestion status (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Suggestion status successfully modified.' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: 'APPROVED' | 'REJECTED' }) {
    return this.suggestionsService.updateStatus(id, body.status);
  }
}
