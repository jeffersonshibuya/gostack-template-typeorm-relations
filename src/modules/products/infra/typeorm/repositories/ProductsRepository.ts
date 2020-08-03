import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const findProduct = await this.ormRepository.findOne({ where: { name } });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const productsFind = await this.ormRepository.findByIds(
      products.map(p => p.id),
    );

    return productsFind;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO
    const productsUpdated: Product[] = [];

    for (const { id, quantity } of products) {
      // eslint-disable-next-line no-await-in-loop
      const prod = await this.ormRepository.findOne(id);
      if (prod) {
        prod.quantity -= quantity;
        productsUpdated.push(prod);
        // eslint-disable-next-line no-await-in-loop
        await this.ormRepository.save(prod);
      }
    }

    return productsUpdated;
  }
}

export default ProductsRepository;
