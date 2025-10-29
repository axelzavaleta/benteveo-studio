import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("estado_usuario")
export class UserStatus {
  @PrimaryGeneratedColumn({ name: "estado_usuario_id" })
  userStatusId!: number 

  @Column({ name: "estado_usuario_nombre", unique: true, nullable: false })
  userStatusName!: string 
}