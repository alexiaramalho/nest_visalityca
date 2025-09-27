import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginMedicoDTO } from './DTO/login.dto';
import { UserSignUpDTO } from 'src/medico/DTO/medico.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registrar')
  @ApiOperation({
    summary: 'Realiza o cadastro de um médico para obter um token JWT',
  })
  async signUp(@Body() userSignUpDTO: UserSignUpDTO) {
    return this.authService.signUp(userSignUpDTO);
  }

  @Post('entrar')
  @ApiOperation({
    summary: 'Realiza o login de um médico para obter um token JWT',
  })
  @ApiBody({ type: LoginMedicoDTO })
  async login(@Body() loginDto: LoginMedicoDTO) {
    const medico = await this.authService.validateMedico(loginDto);
    if (!medico) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    return this.authService.login(medico);
  }
}
