import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medico } from './medico.entity';
import { Repository } from 'typeorm';
import { UserSignUpDTO } from './DTO/medico.dto';

@Injectable()
export class MedicoService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
  ) {}

  async create(userSignUpDTO: UserSignUpDTO): Promise<Medico> {
    const { username, role } = userSignUpDTO;

    const existsUser = await this.findByUsername(username);
    if (existsUser) {
      throw new BadRequestException('Este nome de usuário já está em uso.');
    }
    const user = this.medicoRepository.create(userSignUpDTO);

    return this.medicoRepository.save(user);
  }

  async findByUsername(username: string): Promise<Medico | null> {
    return this.medicoRepository
      .createQueryBuilder('medico')
      .addSelect('medico.senha')
      .where('medico.username = :username', { username })
      .getOne();
  }

  async findById(id: string): Promise<Medico | null> {
    return this.medicoRepository.findOneBy({ id });
  }
}
