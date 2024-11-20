import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, map, Observable } from 'rxjs';
import { identification_type } from './models/identification_type';
import { MERCADO_PAGO_API, MERCADO_PAGO_HEADERS } from 'src/config/config';
import { Installment } from './models/installment';
import { CardTokenBody } from './models/card_token_body';
import { CardTokenResponse } from './models/card_token_response';
import { PaymentBody } from './models/payment_body';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/orders/order.entity';
import { OrderHasProducts } from 'src/orders/order_has_products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MercadoPagoService {

    constructor(
        private readonly httpService: HttpService,

        @InjectRepository(Order) private ordersRepository: Repository<Order>,
        @InjectRepository(OrderHasProducts) private ordersHasProductsRepository: Repository<OrderHasProducts>,
    ) {}

    getIdentificationTypes(): Observable<AxiosResponse<identification_type[]>> {
        return this.httpService.get(MERCADO_PAGO_API + '/identification_types', { headers: MERCADO_PAGO_HEADERS }).pipe(
            catchError((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status);
            })
        ).pipe(map((resp) => resp.data));
    }
    getInstallments(firstSixDigits: number, amount: number): Observable<Installment> {
        return this.httpService.get(MERCADO_PAGO_API + `/payment_methods/installments?bin=${firstSixDigits}&amount=${amount}`, { headers: MERCADO_PAGO_HEADERS }).pipe(
            catchError((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status);
            })
        ).pipe(map((resp: AxiosResponse<Installment>) => resp.data[0]));
    }
    createCardToken(cardTokenBody: CardTokenBody): Observable<CardTokenResponse> {
        return this.httpService.post(
            MERCADO_PAGO_API + `/card_tokens?public_key=TEST-d60d990b-90df-45cf-a170-f41e59c37fd6`,
            cardTokenBody, 
            { headers: MERCADO_PAGO_HEADERS }
        ).pipe(
            catchError((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status);
            })
        ).pipe(map((resp: AxiosResponse<CardTokenResponse>) => resp.data));
    }

    async createPayment(paymentBody: PaymentBody): Promise<Observable<PaymentResponse>> {
        
        const newOrder = this.ordersRepository.create(paymentBody.order);
       const savedOrder = await this.ordersRepository.save(newOrder);

        for (const product of paymentBody.order.products) {
            const ohp = new OrderHasProducts();
            ohp.id_order = savedOrder.id;
            ohp.id_product = product.id;
            ohp.quantity = product.quantity;
            await this.ordersHasProductsRepository.save(ohp);
        }
        
        delete paymentBody.order;

        return this.httpService.post(
            MERCADO_PAGO_API + '/payments',
            paymentBody, 
            { headers: MERCADO_PAGO_HEADERS }
        ).pipe(
            catchError((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status);
            })
        ).pipe(map((resp: AxiosResponse<PaymentResponse>) => resp.data));
    }

}
