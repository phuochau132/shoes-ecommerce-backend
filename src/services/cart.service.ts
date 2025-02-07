import { AddToCartDto } from './../interfaces/cart';
import ApiError from '@/errors/ApiError';
import Cart, { CartItem } from '@/models/cart.model';
import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import ProductService from './product.service';
import { UserType } from '@/interfaces/user';
import Product, { ProductVariant } from '@/models/product.model';
import Order from '@/models/order.model';

@Service()
export default class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @Inject() private productService: ProductService,
  ) {}

  // Add item to cart
  async addToCart(addToCartDto: AddToCartDto) {
    const product = (await this.productService.getProductById(
      addToCartDto.productId,
    )) as Product;
    if (!product) {
      throw new ApiError({ message: 'Product not found' });
    }

    let cart = await this.cartRepository.findOne({
      where: { user: addToCartDto.user },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        items: [],
        user: addToCartDto.user,
      });
      cart = await this.cartRepository.save(cart);
    }

    // Get price
    let price = 0;
    if (addToCartDto.variantId && product.variants.length > 0) {
      const variant: any = product.variants.find(
        (variant) => variant.id == addToCartDto.variantId,
      );
      price = variant.price;
    } else {
      price = product.price;
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.id === addToCartDto.productId ||
        item.variant_id === addToCartDto.variantId,
    );
    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
    } else {
      const newItem: CartItem = {
        product: product,
        variant_id: addToCartDto.variantId,
        quantity: addToCartDto.quantity,
        price: price,
      };
      cart.items.push(newItem);
    }
    cart.total_price = await this.updateTotalPrice(cart);
    return await this.cartRepository.save(cart);
  }
  // Remove item from cart
  async removeFromCart({ user, itemId }: { user: UserType; itemId: number }) {
    const cart = await this.cartRepository.findOne({
      where: { user: user },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.variants',
        'items.product.variants.option_values',
        'items.product.variants.option_values.option_value',
        'items.product.variants.option_values.option_value.option',
      ],
    });

    if (!cart) {
      throw new ApiError({
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => parseInt(item.id as any) === itemId,
    );

    if (itemIndex === -1) {
      throw new ApiError({
        message: 'Item not found in cart',
      });
    }

    const itemToRemove = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);

    // Optionally delete the CartItem directly if cascade delete isn't triggered
    await this.cartItemRepository.delete(itemToRemove.id as any);
    cart.total_price = await this.updateTotalPrice(cart);
    // Save the updated cart
    const newCart = await this.cartRepository.save(cart);

    // Process cart items as needed
    const { items, ...rest } = newCart;
    const newItems = newCart.items.map((item) => {
      const itemClone = { ...item };
      if (item.variant_id && item.product.variants) {
        const variant = item.product.variants.find(
          (variant) => variant.id == item.variant_id,
        );
        const { variants, ...rest } = item.product;
        return {
          ...itemClone,
          product: {
            ...rest,
            variant: variant || {},
          },
        };
      } else {
        const { variants, ...rest } = item.product;
        return {
          ...itemClone,
          product: rest,
        };
      }
    });

    return {
      ...rest,
      items: newItems,
    };
  }

  // Update item quantity in cart
  async updateCartItem({
    user,
    itemId,
    quantity,
  }: {
    user: UserType;
    itemId: number;
    quantity: number;
  }) {
    const cart = await this.cartRepository.findOne({
      where: { user: user },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.variants',
        'items.product.variants.option_values',
        'items.product.variants.option_values.option_value',
        'items.product.variants.option_values.option_value.option',
      ],
    });
    if (!cart) {
      throw new ApiError({
        message: 'Cart not found',
      });
    }
    const item = cart.items.find((item) => item.id == itemId);

    if (!item) {
      throw new ApiError({
        message: 'Cart item not found',
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.id !== itemId);
    } else {
      item.quantity = quantity;
    }
    cart.total_price = await this.updateTotalPrice(cart);
    return await this.cartRepository.save(cart);
  }
  async updateTotalPrice(cart: Cart) {
    return cart.items.reduce((price: number, item: CartItem) => {
      return price + parseInt(item.price as any) * (item.quantity as any);
    }, 0);
  }

  // Get cart details by userId
  async getCartDetails(user: UserType) {
    const cart = await this.cartRepository.findOne({
      where: { user },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.variants',
        'items.product.variants.option_values',
        'items.product.variants.option_values.option_value',
        'items.product.variants.option_values.option_value.option',
      ],
    });
    if (!cart) {
      throw new ApiError({
        message: 'Cart not found',
      });
    }
    // filter variant
    return this.filterVariant(cart);
  }
  async filterVariant(cart: Cart | Order) {
    const { items, ...rest } = cart;
    const newItems = cart.items.map((item) => {
      const itemClone = { ...item };
      if (item.variant_id && item.product.variants) {
        const variant = item.product.variants.filter((variant) => {
          return variant.id == item.variant_id;
        });
        const { variants, ...rest } = item.product;
        const object = {
          ...itemClone,
          product: {
            ...rest,
            variant: variant[0],
          },
        };
        return object;
      } else {
        const { variants, ...rest } = item.product;
        return {
          ...itemClone,
          product: rest,
        };
      }
    });
    const response = {
      ...rest,
      items: newItems,
    };
    return response;
  }
  async clearCart(user: UserType) {
    const cart = await this.cartRepository.findOne({
      where: { user },
      relations: ['items'],
    });
    if (!cart) return;
    await this.cartItemRepository.remove(cart.items);
    cart.items = [];
    await this.cartRepository.save(cart);
  }

  async getCartByUser(user: UserType) {
    const cart = await this.cartRepository.findOne({
      where: { user },
      relations: ['items', 'items.product'],
    });
    if (!cart) {
      throw new ApiError({
        message: 'Cart not found',
      });
    }
    return cart;
  }
}
