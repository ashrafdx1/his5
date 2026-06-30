import { IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Cardiology', description: 'The name of the department' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'Deals with heart disorders and cardiovascular diseases.', description: 'The description of the department', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'قسم القلب', description: 'Arabic name of the department', required: false })
  @IsOptional()
  @IsString()
  arabicName?: string;

  @ApiProperty({ example: 'يتعامل مع اضطرابات القلب وأمراض الأوعية الدموية.', description: 'Arabic description of the department', required: false })
  @IsOptional()
  @IsString()
  arabicDescription?: string;
}
