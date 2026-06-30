import { IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Cardiology Center', description: 'The new name of the department' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'Updated description', description: 'The description of the department', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'قسم القلب الجديد', description: 'Arabic name of the department', required: false })
  @IsOptional()
  @IsString()
  arabicName?: string;

  @ApiProperty({ example: 'الوصف الجديد لوزارة القلب.', description: 'Arabic description of the department', required: false })
  @IsOptional()
  @IsString()
  arabicDescription?: string;
}
