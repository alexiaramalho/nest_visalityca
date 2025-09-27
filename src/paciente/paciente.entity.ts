import { Amostra } from '../amostra/amostra.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 11, nullable: false, unique: true })
  cpf: string;

  @Column({ type: 'date', name: 'data_nascimento', nullable: false })
  dataNascimento: Date;

  @CreateDateColumn()
  dataCriacao: Date;

  @UpdateDateColumn()
  dataAtualizacao: Date;

  @OneToMany(() => Amostra, (amostra) => amostra.paciente, {
    cascade: true,
    // onDelete: 'CASCADE',
  })
  amostras: Amostra[];
}
