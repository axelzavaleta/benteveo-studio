import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm"
import Product from "./product.entity"

@Entity("idiomas")
export class Language {
  @PrimaryGeneratedColumn({ name: "idioma_id" })
  languageId!: number;

  @Column({ name: "idioma_nombre", type: "varchar", length: 50, unique: true })
  languageName!: string;

  @ManyToMany(() => Product, product => product.languages)
  products?: Product[]
}