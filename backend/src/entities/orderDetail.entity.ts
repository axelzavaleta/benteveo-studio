import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany, OneToOne, CreateDateColumn } from "typeorm";
// import Order from "./order.entity";
// import Product from "./product.entity";

@Entity("detalle_orden")
export class OrderDetails {
  @PrimaryGeneratedColumn({ name: "detalle_orden_id" })
  orderDetailsId!: number;

  @Column({ name: "detalle_orden_descripcion", type: "text", nullable: true })
  orderDetailsDesc?: string;

  @Column({ name: "detalle_orden_cantidad", type: "int", nullable: false })
  orderDetailsQuantity!: number;

  @Column({ name: "detalle_orden_precio_unitario", type: "numeric", precision: 12, scale: 2, nullable: false })
  orderDetailsUnitPrice!: number;

  @Column({ name: "detalle_orden_subtotal", type: "numeric", nullable: false })
  orderDetailsSubtotal!: number;

  @CreateDateColumn({ name: "estado_orden_creado_fecha", type: "timestamp with time zone" })
  orderDetailsCreatedAt!: Date;

  @Column({ name: "detalle_orden_orden_id", type: "int", nullable: false })
  orderId!: number;

  @Column({ name: "detalle_orden_producto_id", type: "int", nullable: false })
  productId!: number;

  // @ManyToOne(() => Order, (order) => order.orderId)
  // @JoinColumn({ name: "detalle_orden_orden_id" })
  // order?: Order;

  // @ManyToOne(() => Product)
  // @JoinColumn({ name: "detalle_orden_producto_id" })
  // product?: Product;
}