import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tabTenant')
export class TestTenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 140 })
  name: string;

  @Column({ length: 140, nullable: true })
  domain: string;

  @Column({ length: 20, default: 'Active' }) // Using string instead of enum
  status: string;

  @Column({ length: 20, default: 'Basic' }) // Using string instead of enum
  plan: string;

  @Column({ type: 'text', nullable: true })
  settings: string;

  @CreateDateColumn()
  creation: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column({ length: 140, nullable: true })
  modified_by: string;

  @Column({ length: 140, nullable: true })
  owner: string;
}