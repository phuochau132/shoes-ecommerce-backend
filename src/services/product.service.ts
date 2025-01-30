import { FormattedProduct } from './../interfaces/product';
import { Service } from 'typedi';
import { Brackets, In, Like, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import ApiError from '@/errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import Product, { OptionValue, Review } from '@/models/product.model';
import User from '@/models/user.model';
import { UserType } from '@/interfaces/user';

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
            ...variant,
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
  async getBasicProductInfo(productId: number) {
    return await this.productRepository.findOne({
      where: { id: productId },
    });
  }
  async getProductByHandle(handle: string) {
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

    return this.handleFormatVariant(product);
  }
  async getProductById(id: number) {
    // Fetch product with its variants in a single query
    const product = await this.productRepository.findOne({
      where: { id },
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

    return this.handleFormatVariant(product);
  }
  async handleFormatVariant(product: Product) {
    let productResult: { variants: any[]; [key: string]: any } = {
      variants: [],
    };
    const productVariants = product.variants.map((variant) => {
      const { option_values, ...rest } = variant;
      const object: { id: number; options: OptionValue[] } = {
        ...rest,
        options: [],
      };

      variant.option_values.forEach((item) => {
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

  async getProductsByCollectionHandle(
    collectionHandle: string,
    filters: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ products: any[]; total: number }> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder
      .innerJoin('product.product_collections', 'product_collections')
      .innerJoin('product_collections.collection', 'collection')
      .where('collection.handle = :collectionHandle', { collectionHandle });
    // page limit
    queryBuilder.skip((page - 1) * limit).take(limit);
    // add variant filter
    let filterConditions: string[] = [];

    Object.keys(filters).forEach((key, index) => {
      if (key.startsWith('filter.option.')) {
        const optionName = key.split('.')[2];
        const optionValue = filters[key];

        const variantAlias = `variant${index}`;
        const variantOptionValuesAlias = `variantOptionValues${index}`;
        const variantOptionValueAlias = `variantOptionValue${index}`;
        const optionAlias1 = `option1${index}`;
        const optionAlias2 = `option2${index}`;

        queryBuilder
          .leftJoinAndSelect('product.variants', variantAlias)
          .leftJoinAndSelect(
            `${variantAlias}.option_values`,
            variantOptionValuesAlias,
          )
          .leftJoinAndSelect(
            `${variantOptionValuesAlias}.option_value`,
            variantOptionValueAlias,
          )
          .leftJoinAndSelect(`${variantOptionValueAlias}.option`, optionAlias1)
          .leftJoinAndSelect(`${variantOptionValueAlias}.option`, optionAlias2);

        filterConditions.push(
          `${optionAlias1}.name ='${optionName}' AND ${variantOptionValueAlias}.value ='${optionValue}'`,
        );
      }
    });

    if (filterConditions.length > 0) {
      queryBuilder.andWhere(filterConditions.join(' AND '));
    }

    if (filters['filter.availability']) {
      if (filters['filter.availability'] === '1') {
        queryBuilder.andWhere('product.quantity > 0');
      } else {
        queryBuilder.andWhere('product.quantity = 0');
      }
    }
    // filter with price
    let minPrice = 0;
    let maxPrice = Number.MAX_SAFE_INTEGER;
    if (filters['filter.price.minVal']) {
      minPrice = filters['filter.price.minVal'];
    }
    if (filters['filter.price.maxVal']) {
      maxPrice = filters['filter.price.maxVal'];
    }

    const [products, total] = await queryBuilder
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.reviews', 'reviews')
      .leftJoinAndSelect('variants.option_values', 'optionValues')
      .leftJoinAndSelect('optionValues.option_value', 'optionValue')
      .leftJoinAndSelect('optionValue.option', 'option')
      .leftJoinAndSelect('product.images', 'images')
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            'variants.price >= :minPrice AND variants.price <= :maxPrice',
          ).orWhere(
            'product.price >= :minPrice AND product.price <= :maxPrice',
          );
        }),
      )
      .setParameters({
        minPrice: minPrice,
        maxPrice: maxPrice,
      })
      .getManyAndCount();

    return {
      products: (await Promise.all(
        products.map((product) => this.handleFormatVariant(product)),
      )) as Product[],
      total,
    };
  }
  async filterProducts(query: string) {
    const products = await this.productRepository.find({
      where: [{ title: Like(`%${query}%`) }, { vendor: Like(`%${query}%`) }],
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

    return {
      products: (await Promise.all(
        products.map((product) => this.handleFormatVariant(product)),
      )) as Product[],
    };
  }
}
