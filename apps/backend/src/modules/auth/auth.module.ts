import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SeedService } from './seed/seed.service';
import { Employee } from './entities/employee.entity';
import { Admin } from './entities/admin.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { Role } from '../rbac/entities/role.entity';
import { Permission } from '../rbac/entities/permission.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'his_super_secret_access_key_change_in_prod_2026',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
      },
    }),
    TypeOrmModule.forFeature([Employee, Admin, RefreshToken, LoginAttempt, Role, Permission]),
    RbacModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SeedService],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
