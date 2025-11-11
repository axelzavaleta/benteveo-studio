import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("estado_usuario")
export default class UserStatus {
  @PrimaryGeneratedColumn({ name: "estado_usuario_id" })
  userStatusId!: number 

  @Column({ name: "estado_usuario_nombre", type: "varchar", length: 50, unique: true, nullable: false })
  userStatusName!: string 
}