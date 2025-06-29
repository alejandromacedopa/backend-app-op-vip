import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderHasProducts } from './order_has_products.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(OrderHasProducts) private orderHasProductsRepository: Repository<OrderHasProducts>
  ) {}

  findAll() {
    return this.ordersRepository.find({
      relations: ['user', 'address', 'orderHasProducts.product'],
    });
  }

  findByClient(idClient: number) {
    return this.ordersRepository.find({
      relations: ['user', 'address', 'orderHasProducts.product'],
      where: { id_client: idClient },
    });
  }

  async updateStatus(id: number) {
    const orderFound = await this.ordersRepository.findOneBy({ id: id });
    if (!orderFound) {
      throw new HttpException('Orden no encontrada', HttpStatus.NOT_FOUND);
    }
    const updatedOrder = Object.assign(orderFound, { status: 'DESPACHADO' });
    return this.ordersRepository.save(updatedOrder);
  }

  async create(createOrderDto: CreateOrderDto) {
  // 1. Crear la orden
  const order = this.ordersRepository.create({
    id_client: createOrderDto.id_client,
    id_address: createOrderDto.id_address,
    status: 'PENDIENTE'
  });
  await this.ordersRepository.save(order);

  // 2. Crear los registros en order_has_products
  for (const product of createOrderDto.products) {
    await this.orderHasProductsRepository.save({
      id_order: order.id,
      id_product: product.id,
      quantity: product.quantity
    });  }

  return order;
}
  
}
