import { UserType } from './../interfaces/user';
import { Service } from 'typedi';
import { In, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import ApiError from '@/errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import Product, { OptionValue, Review } from '@/models/product.model';
import User from '@/models/user.model';

@Service()
export default class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Review)
    private productReviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get product by ID with related images
   * @param id - Product ID
   * @returns Product with related images
   */
  async getProductsByIds({ ids }: { ids: number[] }) {
    // Fetch product with its variants in a single query
    const products = await this.productRepository.find({
      where: { id: In(ids) },
      relations: [
        'reviews',
        'reviews.user',
        'images',
        'variants',
        'variants.option_values',
        'variants.option_values.option_value',
        'variants.option_values.option_value.option',
      ],
    });
    if (products) {
      return products.map((product) => {
        let productResult: { variants: any[]; [key: string]: any } = {
          ...product,
          variants: [],
        };

        const productVariants = product.variants.map((variant) => {
          return {
            id: variant.id,
            options: variant.option_values.map(
              (optionValue) => optionValue.option_value,
            ),
          };
        });

        productResult.variants = productVariants;

        return productResult;
      });
    }

    return [];
  }
  async getProductByHandle(handle: string) {
    let productResult: { variants: any[]; [key: string]: any } = {
      variants: [],
    };

    // Fetch product with its variants in a single query
    const product = await this.productRepository.findOne({
      where: { handle },
      relations: [
        'reviews',
        'reviews.user',
        'images',
        'variants',
        'variants.option_values',
        'variants.option_values.option_value',
        'variants.option_values.option_value.option',
      ],
    });

    if (!product) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Product not found!',
      });
    }

    product.reviews.forEach((review) => {
      if (review.user) {
        delete (review.user as any).password;
        delete (review.user as any).timestamp;
      }
    });

    const productVariants = product.variants.map((item) => {
      const object: { id: number; options: OptionValue[] } = {
        id: item.id,
        options: [],
      };

      item.option_values.forEach((item) => {
        object.options.push(item.option_value);
      });

      return object;
    });
    productResult = {
      ...product,
      variants: productVariants,
    };

    return productResult;
  }
  async addReview(review: any) {
    const product = await this.productRepository.findOne({
      where: { id: review.product_id },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    const newReviewUpdate = this.productReviewRepository.create({
      title: review.title,
      content: review.content,
      rating: review.rating,
      user: review.user,
      product: product,
    });

    const newReviewRes = await this.productReviewRepository.save(
      newReviewUpdate,
    );
    delete (newReviewRes as any).product;
    return newReviewRes;
  }
  async removeReview({ reviewID, user }: { reviewID: number; user: UserType }) {
    const review = await this.productReviewRepository.findOne({
      relations: ['user'],
      where: { id: reviewID },
    });

    if (!(review?.user.id == user.id)) {
      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'You are not authorized to perform this action',
      });
    }
    if (review) {
      const newReviewRes = await this.productReviewRepository.remove(review);
      return newReviewRes;
    }
  }
  async getProductByCollectionId(collection_ids: string[]) {
    let productResult: { variants: any[]; [key: string]: any } = {
      variants: [],
    };
    // Fetch product with its variants in a single query
    const products = await this.productRepository.find({
      where: { collection_id: In(collection_ids) },
      relations: [
        'variants',
        'variants.optionValues',
        'variants.optionValues.optionValue',
        'variants.optionValues.optionValue.option',
      ],
    });

    if (!products) {
      throw new ApiError({
        status: StatusCodes.NOT_FOUND,
        message: 'Product not found!',
      });
    }
    if (products) {
      products.map((product) => {
        const productVariants = product.variants.map((item) => {
          const object: { id: number; options: OptionValue[] } = {
            id: item.id,
            options: [],
          };

          item.option_values.forEach((item) => {
            object.options.push(item.option_value);
          });
          productResult = {
            ...product,
            variants: productVariants,
          };
          return object;
        });
      });
    }

    return productResult;
  }
}
