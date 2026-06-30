import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Budget')
@Controller('budget')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Retrieve budget status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Budget retrieved successfully.' })
  async getBudget() {
    return this.budgetService.getBudget();
  }

  @Get('summary')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Retrieve budget summary (Admin only)' })
  @ApiResponse({ status: 200, description: 'Budget summary retrieved successfully.' })
  async getSummary() {
    return this.budgetService.getSummary();
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new budget (Admin only)' })
  async createBudget(@Body() body: { budget_name: string; budget_amount: number }) {
    return this.budgetService.createBudget(body.budget_name, body.budget_amount);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update existing budget (Admin only)' })
  async updateBudget(
    @Param('id') id: string,
    @Body() body: { budget_name: string; budget_amount: number }
  ) {
    return this.budgetService.updateBudget(Number(id), body.budget_name, body.budget_amount);
  }
}
