import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Timestamp from '.';

import { hashPassword } from '@/utils/auth';
import RefreshToken from './refresh-token.model';
import Product from './product.model';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('user')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: false })
  full_name: string;

  @Column({ type: 'varchar', nullable: false })
  telephone: string;

  @Column({ type: 'varchar', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false, default: 'default_image.png' })
  image: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refresh_token: RefreshToken;

  @Column(() => Timestamp, { prefix: false })
  timestamp: Timestamp;

  @OneToMany(() => WishList, (wishlist) => wishlist.user)
  wishlists: WishList[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await hashPassword(this.password);
  }
}

@Entity('wishlist')
export class WishList {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: false })
  product_id: number;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
