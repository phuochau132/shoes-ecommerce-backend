import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Timestamp from '.';
import User from './user.model';
import Collection from './collection.model';
import { decimalTransformer } from '@/utils/decimalTransformerl';
import { ProductLabel } from '@/interfaces/product';

// Product Entity
@Entity('product')
export default class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'decimal', nullable: false, transformer: decimalTransformer })
  price: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  handle: string;

  @Column({ type: 'enum', enum: ProductLabel, nullable: true })
  label?: ProductLabel;

  @Column({ type: 'varchar', nullable: false })
  vendor: string;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(
    () => ProductCollections,
    (product_collection) => product_collection.product,
  )
  product_collections: ProductCollections[];
  @OneToMany(() => Review, (review) => review.product, {
    cascade: true,
  })
  reviews: Review[];

  @Column(() => Timestamp, { prefix: false })
  timestamp: Timestamp;
}

// ProductImage Entity
@Entity('product_image')
export class ProductImage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ type: 'boolean', nullable: false })
  is_main: boolean;
}

// ProductVariant Entity
@Entity('product_variant')
export class ProductVariant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', nullable: false })
  sku: string;

  @Column({ type: 'decimal', nullable: false, transformer: decimalTransformer })
  price: number;

  @Column({ type: 'int', nullable: false })
  stock: number;

  @OneToMany(
    () => ProductVariantOptionValue,
    (option_value) => option_value.variant,
    { cascade: true },
  )
  option_values: ProductVariantOptionValue[];
}

// Option Entity
@Entity('option')
export class Option {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  type: string;

  @OneToMany(() => OptionValue, (option_value) => option_value.option, {
    cascade: true,
  })
  values: OptionValue[];
}

// OptionValue Entity
@Entity('option_value')
export class OptionValue {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Option, (option) => option.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'option_id' })
  option: Option;

  @Column({ type: 'varchar', nullable: false })
  value: string;

  @OneToMany(
    () => ProductVariantOptionValue,
    (variant_option_value) => variant_option_value.option_value,
    { cascade: true },
  )
  variant_option_values: ProductVariantOptionValue[];
}

// ProductVariantOptionValue Entity
@Entity('product_variant_option_value')
export class ProductVariantOptionValue {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => ProductVariant, (variant) => variant.option_values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @ManyToOne(
    () => OptionValue,
    (option_value) => option_value.variant_option_values,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'option_value_id' })
  option_value: OptionValue;
}

// Review Entity
@Entity('product_review')
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'int', nullable: false })
  rating: number;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'datetime', nullable: true })
  created_at: string;
}

@Entity('product_collection')
export class ProductCollections {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Product, (product) => product.product_collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Collection, (collection) => collection.product_collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;
}
