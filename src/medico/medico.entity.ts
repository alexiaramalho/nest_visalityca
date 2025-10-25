import { Amostra } from '../amostra/amostra.entity';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/enums/role.enum';

@Entity('tb_medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  senha: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 11, nullable: false, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 11, nullable: false, unique: true })
  crm: string;

  @Column({ type: 'date', name: 'data_nascimento', nullable: true })
  dataNascimento: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEDICO, // Todo novo usuário será 'medico' por padrão
  })
  role: Role;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Amostra, (amostra) => amostra.medico)
  amostras: Amostra[];

  @BeforeInsert()
  async hashPassword() {
    this.senha = await bcrypt.hash(this.senha, 10);
  }

  async validatePassword(senhaRecebida: string): Promise<boolean> {
    return bcrypt.compare(senhaRecebida, this.senha);
  }
}
