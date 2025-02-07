import { Inject, Service } from 'typedi';
import { getRepository } from 'typeorm';
import Order, { OrderItem } from '@/models/order.model';
import Cart from '@/models/cart.model';
import User from '@/models/user.model';
import CartService from './cart.service';
import { EPaymentMethod, ICreateOrder } from '@/interfaces/order';
import { UserType } from '@/interfaces/user';

@Service()
export default class OrderService {
  private orderRepository = getRepository(Order);
  private orderItemRepository = getRepository(OrderItem);
  @Inject() private cartService: CartService;
  async getOrdersByUser(user: UserType) {
    const orders = await this.orderRepository.find({
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

    return Promise.all(
      orders.map((order) => {
        return this.cartService.filterVariant(order);
      }),
    );
  }
  async createOrder(user: User, data: ICreateOrder) {
    const cart = await this.cartService.getCartByUser(user);
    let is_paid = false;
    if (data.paymentMethod == EPaymentMethod.paypal) {
      is_paid = true;
    }
    const order = this.orderRepository.create({
      user,
      cart,
      payment_method: data.paymentMethod,
      city: data.city,
      country: data.country,
      detail_address: data.detailAddress,
      postal_code: data.postalCode,
      total_amount: cart.total_price,
      status: 'pending',
      is_paid: is_paid,
      note: data.note,
    });

    order.items = cart.items.map((cartItem) => {
      return this.orderItemRepository.create({
        product: cartItem.product,
        variant_id: cartItem.variant_id,
        quantity: cartItem.quantity,
        price: cartItem.price,
      });
    });

    const savedOrder = await this.orderRepository.save(order);
    await this.cartService.clearCart(user);
    return savedOrder;
  }

  async updatePaymentStatus(orderId: string, paymentId: string) {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) {
      throw new Error('Order not found.');
    }

    order.status = 'paid';
    order.is_paid = true;

    await this.orderRepository.save(order);
    return order;
  }
}
