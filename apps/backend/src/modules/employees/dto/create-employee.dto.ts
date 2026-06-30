import { IsNotEmpty, IsString, IsEmail, IsNumber, IsDateString, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'أحمد', description: 'Arabic first name' })
  @IsNotEmpty()
  @IsString()
  arabic_first_name: string;

  @ApiProperty({ example: 'محمد', description: 'Arabic middle name' })
  @IsNotEmpty()
  @IsString()
  arabic_middle_name: string;

  @ApiProperty({ example: 'خالد', description: 'Arabic last name' })
  @IsNotEmpty()
  @IsString()
  arabic_last_name: string;

  @ApiProperty({ example: 'Ahmed', description: 'English first name' })
  @IsNotEmpty()
  @IsString()
  english_first_name: string;

  @ApiProperty({ example: 'Mohamed', description: 'English middle name' })
  @IsNotEmpty()
  @IsString()
  english_middle_name: string;

  @ApiProperty({ example: 'Khaled', description: 'English last name' })
  @IsNotEmpty()
  @IsString()
  english_last_name: string;

  @ApiProperty({ example: 'male', description: 'Gender selection (male or female)' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['male', 'female'])
  gender: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date of birth' })
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: string;

  @ApiProperty({ example: 'doctor', description: 'Employment type selection (doctor or staff)' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['doctor', 'staff'])
  employment_type: string;

  @ApiProperty({ example: '+966500000000', description: 'Contact phone number' })
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @ApiProperty({ example: 'ahmed.khaled@his-hospital.com', description: 'Valid contact email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 4500.00, description: 'Monthly base salary' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiProperty({ example: '/uploads/abc123_profile.png', description: 'Uploaded photo URL path' })
  @IsNotEmpty()
  @IsString()
  employee_picture_url: string;
}
