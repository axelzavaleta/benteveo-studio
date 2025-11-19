import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import ProductTags from "./productTags.entity";

@Entity("producto")
export default class Product {
  @PrimaryGeneratedColumn({ name: "producto_id" })
  productId!: number;

  @Column({ name: "producto_nombre", type: "text", nullable: false })
  productName!: string;

  @Column({ name: "producto_descripcion", type: "text", nullable: false })
  productDesc!: string;

  @Column({ name: "producto_tipo", type: "varchar", length: 50, nullable: true, default: "digital" })
  productType?: string;

  @Column({ name: "producto_formato", type: "varchar", length: 100, nullable: true })
  productFormat?: string;

  @Column({ name: "producto_tamano_mb", type: "numeric", precision: 10, scale: 2, nullable: false })
  productSize!: number;

  @Column({ name: "producto_url_descarga", type: "text", nullable: true })
  productDownloadUrl?: string
  
  @Column({ name: "producto_licencia", type: "varchar", length: 1000, nullable: true })
  productLicense?: string;

  @Column({ name: "producto_imagen_url", type: "text", nullable: true })
  productImageUrl?: string;
  
  @Column({ name: "producto_descuento", type: "float", default: 0, nullable: true })
  productDiscount?: number;

  @Column({ name: "producto_precio", type: "numeric", precision: 12, scale: 2, nullable: false })
  productPrice!: number;

  @Column({ name: "producto_moneda", type: "char", length: 3, default: "ARS", nullable: true })
  productLocalCurrency?: string;

  @Column({ name: "etiqueta_id", type: "int", nullable: true })
  productTagsId?: number;

  @Column({ name: "producto_activo", type: "boolean", default: true, nullable: false })
  productIsActive!: boolean;

  @CreateDateColumn({ name: "producto_creado_fecha", type: "timestamp with time zone" })
  productCreatedAt!: Date;

  @UpdateDateColumn({ name: "producto_actualizado_fecha", type: "timestamp with time zone" })
  productUpdatedAt!: Date;

  // @ManyToMany(() => ProductTags)
  // @JoinColumn({ name: "etiqueta_id" })
  // productTags?: ProductTags;
}