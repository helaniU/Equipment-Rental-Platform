import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'super_secret_jwt_key_12345',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Role]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}