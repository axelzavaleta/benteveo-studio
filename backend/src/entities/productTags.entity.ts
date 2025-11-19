import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("etiquetas")
export default class ProductTags {
  @PrimaryGeneratedColumn({ name: "etiqueta_id" })
  productTagId: number;

  @Column({ name: "etiqueta_nombre", type: "text", nullable: false, unique: true })
  productTagName: string;
}