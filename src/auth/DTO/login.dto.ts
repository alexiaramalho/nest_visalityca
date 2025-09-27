import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginMedicoDTO {
  @ApiProperty({
    description: 'Nome de usuário para o login',
    example: 'drcarlos',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Senha do médico',
    example: 'senhaForte123',
  })
  @IsString()
  @IsNotEmpty()
  senha: string;
}
