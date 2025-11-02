import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MedicoService } from 'src/medico/medico.service';
import { LoginMedicoDTO } from './DTO/login.dto';
import { Medico } from 'src/medico/medico.entity';
import { UserSignUpDTO } from 'src/medico/DTO/medico.dto';

@Injectable()
export class AuthService {
  constructor(
    private medicoService: MedicoService,
    private jwtService: JwtService,
  ) {}

  async signUp(
    userSignUpDTO: UserSignUpDTO,
  ): Promise<{ access_token: string }> {
    const medico = await this.medicoService.create(userSignUpDTO);
    return this.login(medico);
  }

  async validateMedico(loginDto: LoginMedicoDTO): Promise<Medico | null> {
    const { username, senha } = loginDto;
    const medico = await this.medicoService.findByUsername(username);

    if (medico && (await medico.validatePassword(senha))) {
      return medico;
    }

    return null;
  }

  login(medico: Medico) {
    const payload = {
      username: medico.username,
      sub: medico.id,
      role: medico.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      nome: medico.nome,
      role: medico.role,
      sub: medico.id,
    };
  }
}
