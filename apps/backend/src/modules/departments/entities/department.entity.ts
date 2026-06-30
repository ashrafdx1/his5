import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('department')
export class Department {
  @PrimaryColumn({ name: 'department_id', type: 'integer' })
  departmentId: number;

  @Column({ name: 'department_name', unique: true, type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'department_description', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ name: 'last_edited', type: 'timestamp with time zone', nullable: true })
  lastEdited: Date;

  @Column({ name: 'department_management', type: 'varchar', length: 10, default: 'no' })
  departmentManagement: string;

  @Column({ name: 'department-mgr-id', type: 'integer', default: 0 })
  departmentMgrId: number;

  @Column({ name: 'dept-arabic-name', type: 'varchar', length: 100, nullable: true })
  arabicName: string | null;

  @Column({ name: 'dept-arabic-description', type: 'text', nullable: true })
  arabicDescription: string | null;
}
