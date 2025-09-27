import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';

export class UserSignUpDTO {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nome: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(
    /(?:(?=.*\d)|(?=.*[@#$%^&*()_+\[\]{};':",.<>\/?\\|\-~]))(?=.*[A-Z])(?=.*[a-z]).*$/,
  )
  senha: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty()
  @IsString()
  crm?: string;

  @ApiProperty({
    description:
      'Papel do usuário (opcional, apenas para admins criarem outros usuários)',
    enum: Role,
    default: Role.MEDICO,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
