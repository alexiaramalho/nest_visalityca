import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { RequestWithMedico } from 'src/auth/types/request-with-medico.interface';
import { MedicoService } from 'src/medico/medico.service';
import { UserSignUpDTO } from 'src/medico/DTO/medico.dto';
import { PaginationQueryDto } from 'src/shared/DTO/pagination-query.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private medicoService: MedicoService,
  ) {}

  @Get('requests')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Lista todas as solicitações de exclusão pendentes',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPendingRequests(@Query() paginationQuery: PaginationQueryDto) {
    return this.adminService.getPendingRequests(paginationQuery);
  }

  @Patch('requests/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Aprova uma solicitação de exclusão' })
  @ApiBearerAuth()
  approveRequest(@Param('id') id: string, @Request() req: RequestWithMedico) {
    const admin = req.user;
    return this.adminService.reviewRequest(id, true, admin);
  }

  @Patch('requests/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Recusa uma solicitação de exclusão' })
  @ApiBearerAuth()
  rejectRequest(@Param('id') id: string, @Request() req: RequestWithMedico) {
    const admin = req.user;
    return this.adminService.reviewRequest(id, false, admin);
  }
}
