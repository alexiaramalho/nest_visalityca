import { Amostra } from '../amostra/amostra.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('tb_medicos')
export class Medico {
  @PrimaryGeneratedColumn({ name: 'id_medico' })
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  nome: string;

  @Column({ type: 'varchar', length: 11, nullable: false, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 11, nullable: false, unique: true })
  crm: string;

  @Column({ type: 'date', name: 'data_nascimento', nullable: false })
  dataNascimento: Date;

  @OneToMany(() => Amostra, (amostra) => amostra.medico)
  amostras: Amostra[];
}