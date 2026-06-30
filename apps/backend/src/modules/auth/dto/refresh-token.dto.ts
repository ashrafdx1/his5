import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The valid refresh token string' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
