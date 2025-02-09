import { Inject, Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { UserRegisterDto, UserUpdateDto } from '@/interfaces/user';
import User, { WishList } from '@/models/user.model';
import { hashPassword } from '@/utils/auth';
import ApiError from '@/errors/ApiError';
import ProductService from './product.service';
import Product from '@/models/product.model';

@Service()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(WishList)
    private wishlistRepository: Repository<WishList>,
    @Inject() private productService: ProductService,
  ) {}

  async createUser(userRegisterDto: UserRegisterDto) {
    const user = this.userRepository.create({
      full_name: userRegisterDto.full_name,
      telephone: userRegisterDto.telephone,
      address: userRegisterDto.address,
      email: userRegisterDto.email,
      role: userRegisterDto.role,
      password: userRegisterDto.password,
    });

    return await this.userRepository.save(user);
  }

  async getProfile(userParam: User) {
    const user = await this.userRepository.findOne({
      relations: ['wishlists'],
      where: { id: userParam.id },
    });
    if (!user) {
      throw new ApiError({
        message: 'User not found',
      });
    }
    // @ts-ignore
    delete user.password;
    return {
      ...user,
      image:
        user.image == 'default_image.png'
          ? `${process.env.SERVER_URL}/static/images/${user.image}`
          : user.image,
    };
  }
  async updateUser(userId: string, user: UserUpdateDto) {
    const existingUser = await this.userRepository.findOne({ id: userId });
    if (!existingUser) {
      throw new ApiError({
        message: 'User not found',
      });
    }
    const updatedUser = { ...existingUser, ...user };
    return this.userRepository.save(updatedUser);
  }

  async updatePassword(userId: string, password: string) {
    const hashedPassword = await hashPassword(password);
    return this.userRepository.update(userId, { password: hashedPassword });
  }
  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  async findById(id: string) {
    const user = await this.userRepository.findOneOrFail(id);
    return user;
  }
  async verifyEmailById(id: string) {
    const user = await this.userRepository.findOneOrFail(id);
    await this.userRepository.update(user.id, { is_verified: true });
    return user;
  }

  async getStatistics() {
    const count = await this.userRepository.count();
    return count;
  }
  async getWishlistByUserId(user: User) {
    const wishlists = await this.wishlistRepository.find({
      where: { user: user },
    });
    const data = await this.productService.getProductByIDs(
      wishlists.map((wishlist) => wishlist.product_id),
    );
    const wishlistWithProducts = wishlists.map((wishlist) => {
      const product = data.products.find((p) => p.id === wishlist.product_id);
      return {
        wishlist_id: wishlist.id,
        product: product ? product : null,
      };
    });
    return wishlistWithProducts;
  }
  async addWishList({
    productId,
    userParam,
  }: {
    productId: number;
    userParam: User;
  }) {
    const product = await this.productService.getBasicProductInfo(productId);
    if (!product) {
      throw new ApiError({
        message: 'Product Not Found',
      });
    }
    const user = await this.userRepository.findOneOrFail(userParam.id, {
      relations: ['wishlists'],
    });
    if (user) {
      const wishlist = await this.wishlistRepository.save({
        product_id: productId,
        user,
      });
      const newWishlist = {
        product_id: productId,
        id: wishlist.id,
      };
      return { wishlists: [newWishlist, ...user.wishlists] };
    }
  }
  async removeWishList({ id, userParam }: { id: number; userParam: User }) {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userParam.id },
      relations: ['wishlists'],
    });

    const wishlist = await this.wishlistRepository.findOne({
      where: { id: id },
    });
    const rs = await this.getWishlistByUserId(user);

    if (!wishlist) {
      throw new ApiError({
        message: 'Wishlist not found or does not belong to the user',
      });
    }

    await this.wishlistRepository.remove(wishlist);

    return {
      wishlists: user.wishlists.filter((wishlist) => wishlist.id != id),
    };
  }
}
