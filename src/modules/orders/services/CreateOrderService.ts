import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('Customer not found!', 400);

    const prods = await this.productsRepository.findAllById(products);

    if (!prods || prods.length === 0)
      throw new AppError('producs not found!', 400);

    const prodsUpdated = await this.productsRepository.updateQuantity(products);

    const myProds = prodsUpdated.map(p => {
      return { product_id: p.id, price: p.price, quantity: p.quantity };
    });

    myProds.forEach(product => {
      const prod = products.find(p => p.id === product.product_id);
      if (prod) {
        if (prod.quantity > product.quantity)
          throw new AppError('Insufficient Stock', 400);

        Object.assign(product, { quantity: prod.quantity });
      }
    });

    const order = this.ordersRepository.create({
      customer,
      products: myProds,
    });

    return order;
  }
}

export default CreateOrderService;
