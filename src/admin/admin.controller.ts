import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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

  @Get('medicos')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lista todos os usuários com perfil de Médico' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listMedicos(@Query() paginationQuery: PaginationQueryDto) {
    return this.adminService.listMedicos(paginationQuery);
  }

  @Delete('medicos/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Exclui um usuário com perfil de Médico' })
  @ApiBearerAuth()
  async deleteMedico(
    @Param('id') id: string,
    @Request() req: RequestWithMedico,
  ) {
    await this.adminService.deleteUser(id, req.user.id);
    return { message: 'Médico excluído com sucesso.' };
  }

  @Get('admins')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lista todos os usuários com perfil de Admin' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listAdmins(@Query() paginationQuery: PaginationQueryDto) {
    return this.adminService.listAdmins(paginationQuery);
  }

  @Delete('admins/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Exclui um usuário com perfil de Admin' })
  @ApiBearerAuth()
  async deleteAdmin(
    @Param('id') id: string,
    @Request() req: RequestWithMedico,
  ) {
    await this.adminService.deleteUser(id, req.user.id);
    return { message: 'Administrador excluído com sucesso.' };
  }

  @Get('requests/patients')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Lista solicitações pendentes de exclusão de pacientes',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPendingPatientRequests(@Query() paginationQuery: PaginationQueryDto) {
    return this.adminService.getPendingPatientRequests(paginationQuery);
  }

  @Get('requests/exams')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Lista solicitações pendentes de exclusão de exames',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPendingExamRequests(@Query() paginationQuery: PaginationQueryDto) {
    return this.adminService.getPendingExamRequests(paginationQuery);
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
