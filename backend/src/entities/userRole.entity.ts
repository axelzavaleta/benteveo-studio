import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("rol_usuario")
export default class UserRole {
  @PrimaryGeneratedColumn({ name: "rol_usuario_id" })
  userRoleId!: number

  @Column({ name: "rol_usuario_nombre", type: "varchar", length: 50, unique: true, nullable: false })
  userRoleName!: string

  @Column({ name: "rol_usuario_permisos", type: "jsonb", nullable: true })
  userRolePermissions?: object
}