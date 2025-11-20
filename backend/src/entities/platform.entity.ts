import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm"
import Product from "./product.entity"

@Entity("plataformas")
export class Platform {
  @PrimaryGeneratedColumn({ name: "plataforma_id" })
  platformId!: number;

  @Column({ name: "plataforma_nombre", type: "varchar", length: 50, unique: true })
  platformName!: string;

  @ManyToMany(() => Product, product => product.platforms)
  products?: Product[]
}