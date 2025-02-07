import { UserType } from './user';

export interface AddToCartDto {
  user: UserType;
  productId: number;
  variantId: number;
  quantity: number;
}
