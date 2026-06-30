import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../../rbac/entities/role.entity';

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn({ name: 'employee_id' })
  employee_id: number;

  @Column({ unique: true, type: 'varchar', length: 50, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string;

  @Column({ name: 'arabic_first_name', type: 'varchar', length: 100 })
  arabic_first_name: string;

  @Column({ name: 'arabic_middle_name', type: 'varchar', length: 100, nullable: true })
  arabic_middle_name: string;

  @Column({ name: 'arabic_last_name', type: 'varchar', length: 100 })
  arabic_last_name: string;

  @Column({ name: 'english_first_name', type: 'varchar', length: 100 })
  english_first_name: string;

  @Column({ name: 'english_middle_name', type: 'varchar', length: 100, nullable: true })
  english_middle_name: string;

  @Column({ name: 'english_last_name', type: 'varchar', length: 100 })
  english_last_name: string;

  @Column({ type: 'varchar', length: 10 })
  gender: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  date_of_birth: Date;

  @Column({ name: 'employment_type', type: 'varchar', length: 20 })
  employment_type: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  title: string | null;

  @Column({ name: 'department_id', type: 'integer', nullable: true })
  department_id: number;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phone_number: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0.00 })
  salary: number;

  @Column({ name: 'employee_picture_url', type: 'varchar', length: 2048, nullable: true })
  employee_picture_url: string;

  @Column({ type: 'integer', default: 0 })
  login_count: number;

  @Column({ type: 'integer', default: 0 })
  password_change_count: number;

  @Column({ type: 'integer', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  locked_until: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_password_change_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_username_change_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToMany(() => Role, (role) => role.employees, { cascade: true })
  @JoinTable({
    name: 'employee_roles',
    joinColumn: { name: 'employee_id', referencedColumnName: 'employee_id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
