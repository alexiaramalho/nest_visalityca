import { Request } from 'express';
import { Medico } from 'src/medico/medico.entity';

export interface RequestWithMedico extends Request {
  user: Medico;
}
