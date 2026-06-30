import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee profile' })
  @ApiResponse({ status: 201, description: 'Employee profile created successfully.' })
  @ApiResponse({ status: 409, description: 'Employee email already exists.' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all employee profiles' })
  @ApiResponse({ status: 200, description: 'List of employees retrieved successfully.' })
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific employee profile' })
  @ApiResponse({ status: 200, description: 'Employee profile retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Employee profile not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee profile' })
  @ApiResponse({ status: 200, description: 'Employee profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'Employee profile not found.' })
  @ApiResponse({ status: 409, description: 'Employee email already exists.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee profile' })
  @ApiResponse({ status: 200, description: 'Employee profile successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Employee profile not found.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.employeesService.remove(id);
    return { success: true, message: 'Employee successfully deleted.' };
  }
}
