import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("estado_orden")
export class OrderStatus {
  @PrimaryGeneratedColumn({ name: "estado_orden_id" })
  orderStatusId!: number;

  @Column({ name: "estado_orden_nombre", type: "varchar", length: 50, nullable: false, unique: true })
  orderStatusName!: string;

  @Column({ name: "estado_orden_descripcion", type: "text", nullable: true })
  orderStatusDesc?: string;
}