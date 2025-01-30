import { UserType } from './user';

export class AddToCartDto {
  user: UserType;
  productId: number;
  variantId: number;
  quantity: number;
}
