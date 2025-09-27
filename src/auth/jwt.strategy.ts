import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { MedicoService } from 'src/medico/medico.service';
import { Medico } from 'src/medico/medico.entity';
import type { EnvironmentVariables } from 'src/config/environment-variables.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    private medicoService: MedicoService,
  ) {
    const secret = configService.get('JWT_SECRET', { infer: true });

    if (!secret) {
      throw new InternalServerErrorException(
        'A variável de ambiente JWT_SECRET não foi definida.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; username: string }): Promise<Medico> {
    const medico = await this.medicoService.findById(payload.sub);

    if (!medico) {
      throw new UnauthorizedException(
        'Token inválido ou médico não encontrado.',
      );
    }

    return medico;
  }
}
