import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductCollections } from './product.model';

@Entity('collection')
export default class Collection {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  handle: string;

  @Column({ type: 'varchar', nullable: false })
  image: string;

  @OneToMany(
    () => ProductCollections,
    (product_collections) => product_collections.collection,
  )
  product_collections: ProductCollections[];
}
