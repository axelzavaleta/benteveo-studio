import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  ManyToMany, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn,
  JoinTable
} from "typeorm";
import { Tag } from "./productTag.entity";
import { Platform } from "./platform.entity";
import { Language } from "./language.entity";

@Entity("producto")
export default class Product {
  @PrimaryGeneratedColumn({ name: "producto_id" })
  productId!: number;

  @Column({ name: "producto_nombre", type: "text", nullable: false })
  productName!: string;

  @Column({ name: "producto_descripcion_corta", type: "text", nullable: false })
  productShortDesc!: string;

  @Column({ name: "producto_descripcion_larga", type: "text", nullable: false })
  productLongDesc!: string;

  @Column({ name: "producto_tipo", type: "varchar", length: 50, default: "digital" })
  productType?: string;

  @Column({ name: "producto_formato", type: "varchar", length: 100, nullable: true })
  productFormat?: string;

  @Column({ name: "producto_tamano_mb", type: "int" })
  productSize!: number;

  @Column({ name: "producto_url_descarga", type: "text", nullable: true })
  productDownloadUrl?: string;

  @Column({ name: "producto_desarrollador", type: "text", nullable: false })
  productDeveloper!: string;

  @Column({ name: "producto_imagen_portada", type: "text", nullable: false })
  productCoverImageUrl!: string;

  @Column({ name: "producto_imagen_catalogo", type: "text", nullable: false })
  productCatalogImageUrl!: string;
  
  @Column({ name: "producto_descuento", type: "float", default: 0 })
  productDiscount?: number;

  @Column({ name: "producto_precio", type: "int", nullable: false })
  productPrice!: number;

  @Column({ name: "producto_activo", type: "boolean", default: true })
  productIsActive!: boolean

  @Column({ name: "producto_fecha_lanzamiento", type: "date", nullable: false })
  productReleasedDate!: Date

  @CreateDateColumn({ name: "producto_creado_fecha", type: "timestamp with time zone" })
  productCreatedAt!: Date

  @UpdateDateColumn({ name: "producto_actualizado_fecha", type: "timestamp with time zone" })
  productUpdatedAt!: Date

  @ManyToMany(() => Tag, tag => tag.products)
  @JoinTable({
    name: "producto_etiquetas",
    joinColumn: { name: "producto_id", referencedColumnName: "productId" },
    inverseJoinColumn: { name: "etiqueta_id", referencedColumnName: "tagId" }
  })
  tags!: Tag[];

  @ManyToMany(() => Platform, platform => platform.products)
  @JoinTable({
    name: "producto_plataformas",
    joinColumn: { name: "producto_id", referencedColumnName: "productId" },
    inverseJoinColumn: { name: "plataforma_id", referencedColumnName: "platformId" }
  })
  platforms!: Platform[];

  @ManyToMany(() => Language, language => language.products)
  @JoinTable({
    name: "producto_idiomas",
    joinColumn: { name: "producto_id", referencedColumnName: "productId" },
    inverseJoinColumn: { name: "idioma_id", referencedColumnName: "languageId" }
  })
  languages!: Language[];
}