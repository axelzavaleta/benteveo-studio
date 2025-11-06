import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserStatus } from "./userStatus.entity";
import { UserRole } from "./userRole.entity";
import "reflect-metadata"

@Entity("usuario")
export class User {
  @PrimaryGeneratedColumn({ name: "usuario_id" })
  userId!: number

  @Column({ name: "usuario_nombre", type: "text", nullable: false })
  userName!: string

  @Column({ name: "usuario_email", type: "text", unique: true, nullable: false })
  userEmail!: string

  @Column({ name: "usuario_pass", type: "text", nullable: false })
  userPassword!: string

  @Column({ name: "usuario_telefono", type: "text", nullable: true })
  userPhoneNumber?: string

  @Column({ name: "usuario_avatar_url", type: "text", nullable: true })
  userAvatarUrl?: string

  @Column({ name: "usuario_ultimo_login", type: "timestamp with time zone", nullable: true })
  userLastLogin?: Date

  @CreateDateColumn({ name: "usuario_creado_fecha", type: "timestamp with time zone" })
  userCreatedAt!: Date

  @UpdateDateColumn({ name: "usuario_actualizado_fecha", type: "timestamp with time zone" })
  userUpdatedAt!: Date

  @Column({ name: "estado_usuario_id", type: "int", nullable: true, default: null})
  userStatusId?: number

  @Column({ name: "rol_usuario_id", type: "int", nullable: true, default: null })
  userRoleId?: number

  @ManyToOne(() => UserStatus)
  @JoinColumn({ name: "estado_usuario_id" })
  userStatus?: UserStatus

  @ManyToOne(() => UserRole)
  @JoinColumn({ name: "rol_usuario_id" })
  userRole?: UserRole
}
