import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import Cart from './cart.model';
import User from './user.model';
import Timestamp from '.';
import Product from './product.model';

@Entity('order')
export default class Order {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Cart, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['cash_on_delivery', 'paypal'],
    default: 'cash_on_delivery',
  })
  payment_method: string;

  @Column({ type: 'boolean', default: false })
  is_paid: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', length: 255 })
  detail_address: string;

  @Column({ type: 'varchar', length: 1000 })
  note: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  postal_code: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column(() => Timestamp, { prefix: false })
  timestamp: Timestamp;
}
@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', nullable: true })
  variant_id: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
