import { Inject, Service } from 'typedi';

import ProductService from './product.service';
import { InjectRepository } from 'typeorm-typedi-extensions';
import Collection from '@/models/collection.model';
import { Repository } from 'typeorm';

@Service()
export default class CollectionService {
  constructor(
    @Inject() private productService: ProductService,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
  ) {}

  async getCollectionByHandle({
    collectionHandle,
    filters,
  }: {
    collectionHandle: string;
    filters: any;
  }) {
    const page = filters.page ? filters.page : 1;
    const result =
      await this.productService.getProductsDetailsByCollectionHandle(
        collectionHandle,
        filters,
        page,
        filters.limit || 8,
      );
    const collection = await this.collectionRepository.findOne({
      where: { handle: collectionHandle },
    });
    if (!result) {
      throw new Error(`Collection with ID ${collectionHandle} not found`);
    }
    return {
      ...collection,
      products: result.products,
      total: result.total,
    };
  }
  async getAllCollection() {
    const collections = await this.collectionRepository.find({
      relations: ['product_collections', 'product_collections.product'],
    });
    return {
      collections,
    };
  }
}
