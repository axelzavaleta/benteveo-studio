import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("orden")
export default class Order {
  @PrimaryGeneratedColumn({ name: "orden_id" })
  orderId!: number;

  @Column({ name: "orden_subtotal", type: "numeric", precision: 12, scale: 2, nullable: true })
  orderSubtotal?: number;

  @Column({ name: "orden_descuento", type: "numeric", precision: 12, scale: 2, default: 0, nullable: true })
  orderDiscount?: number;

  @Column({ name: "orden_total", type: "numeric", precision: 12, scale: 2, nullable: false })
  orderTotal!: number;
  
  @Column({ name: "orden_descripcion", type: "text", nullable: true })
  orderDesc?: string;

  @Column({ name: "orden_usuario_id", type: "int", nullable: true })
  orderUserId?: number;
  
  @Column({ name: "orden_cliente_id", type: "int", nullable: true })
  orderClientId?: number;
  
  @Column({ name: "orden_estado_id", type: "int", nullable: false })
  orderStatusId!: number;

  @CreateDateColumn({ name: "orden_creado_fecha", type: "timestamp with time zone" })
  orderCreatedAt!: Date;

  @UpdateDateColumn({ name: "orden_actualizado_fecha", type: "timestamp with time zone" })
  orderUpdatedAt!: Date
}