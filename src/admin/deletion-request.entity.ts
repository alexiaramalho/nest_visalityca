import { Medico } from 'src/medico/medico.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemType } from './enums/item-type.enum';
import { RequestStatus } from './enums/request-status.enum';

@Entity('tb_deletion_requests')
export class DeletionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ItemType })
  itemType: ItemType;

  @Column()
  itemId: string;

  @Column({ type: 'text', nullable: true })
  justificativa: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDENTE,
  })
  status: RequestStatus;

  @ManyToOne(() => Medico)
  requester: Medico;

  @ManyToOne(() => Medico, { nullable: true })
  reviewer?: Medico;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  reviewedAt: Date;
}
