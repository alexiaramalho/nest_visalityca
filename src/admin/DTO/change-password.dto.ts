import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
  })
  newPassword: string;
}