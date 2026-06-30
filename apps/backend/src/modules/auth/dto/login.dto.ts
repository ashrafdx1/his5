import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'Admin0', description: 'The case-sensitive username' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  username: string;

  @ApiProperty({ example: 'Admin&Pass1', description: 'The case-sensitive password' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;
}
