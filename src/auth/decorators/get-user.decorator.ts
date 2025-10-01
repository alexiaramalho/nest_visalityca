import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Medico } from 'src/medico/medico.entity';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Medico => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return request.user as Medico;
  },
);
