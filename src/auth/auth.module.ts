import {
  Module,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MedicoModule } from 'src/medico/medico.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { EnvironmentVariables } from 'src/config/environment-variables.interface';

@Module({
  imports: [
    forwardRef(() => MedicoModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        const secret = configService.get('JWT_SECRET', { infer: true });
        const expiresIn = configService.get('JWT_EXPIRATION', { infer: true });

        if (!secret || !expiresIn) {
          throw new InternalServerErrorException(
            'As variáveis de ambiente JWT_SECRET ou JWT_EXPIRATION não foram definidas.',
          );
        }

        return {
          secret: secret,
          signOptions: {
            expiresIn: expiresIn,
          },
        };
      },
    }),
    ConfigModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}
