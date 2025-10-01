import { Medico } from 'src/medico/medico.entity';

declare global {
  namespace Express {
    export interface Request {
      user?: Medico;
    }
  }
}