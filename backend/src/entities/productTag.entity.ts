import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import Product from "./product.entity"

@Entity("etiquetas")
export class Tag {
  @PrimaryGeneratedColumn({ name: "etiqueta_id" })
  tagId!: number;

  @Column({ name: "etiqueta_nombre", type: "varchar", length: 50, unique: true })
  tagName!: string;

  @ManyToMany(() => Product, product => product.tags)
  products?: Product[]
}