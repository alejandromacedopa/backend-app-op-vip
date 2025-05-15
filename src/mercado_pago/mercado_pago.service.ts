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
import { PaymentResponse } from './models/payment_response';

@Injectable()
export class MercadoPagoService {
  constructor(
    private readonly httpService: HttpService,

    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(OrderHasProducts)
    private ordersHasProductsRepository: Repository<OrderHasProducts>
  ) {}

  getIdentificationTypes(): Observable<AxiosResponse<identification_type[]>> {
    return this.httpService
      .get(MERCADO_PAGO_API + '/identification_types', { headers: MERCADO_PAGO_HEADERS })
      .pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(error.response.data, error.response.status);
        })
      )
      .pipe(map(resp => resp.data));
  }
  getInstallments(firstSixDigits: number, amount: number): Observable<Installment> {
    return this.httpService
      .get(
        MERCADO_PAGO_API + `/payment_methods/installments?bin=${firstSixDigits}&amount=${amount}`,
        { headers: MERCADO_PAGO_HEADERS }
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(error.response.data, error.response.status);
        })
      )
      .pipe(map((resp: AxiosResponse<Installment>) => resp.data[0]));
  }
  createCardToken(cardTokenBody: CardTokenBody): Observable<CardTokenResponse> {
    return this.httpService
      .post(
        MERCADO_PAGO_API + `/card_tokens?public_key=TEST-1eb2af36-3c1f-410c-9288-0be2394e115b`,

        cardTokenBody,
        { headers: MERCADO_PAGO_HEADERS }
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(error.response.data, error.response.status);
        })
      )
      .pipe(map((resp: AxiosResponse<CardTokenResponse>) => resp.data));
  }

  async createPayment(paymentBody: PaymentBody): Promise<Observable<SimplifiedPaymentResponse>> {
    console.log('Headers recibidos:', MERCADO_PAGO_HEADERS);
    console.log('paymentBody recibido:', paymentBody);

    try {
      // Transacción en la base de datos (en una sola transacción si es posible)
      const newOrder = this.ordersRepository.create(paymentBody.order);
      const savedOrder = await this.ordersRepository.save(newOrder);

      await this.ordersHasProductsRepository.save(
        paymentBody.order.products.map(product => ({
          id_order: savedOrder.id,
          id_product: product.id,
          quantity: product.quantity,
        }))
      );
      delete paymentBody.order; // Elimina la propiedad 'order'

      return this.httpService
        .post(MERCADO_PAGO_API + '/payments', paymentBody, { headers: MERCADO_PAGO_HEADERS })
        .pipe(
          map((resp: AxiosResponse<PaymentResponse>) => {
            console.log('Respuesta completa:', resp.data);
            return this.simplifyPaymentResponse(resp.data);
          }),
          catchError((error: AxiosError) => {
            console.error('Error:', error.response?.data || error.message);
            // Manejo de rollback en la BD si falla Mercado Pago
            //  (Implementa la lógica para revertir las inserciones en la base de datos si la transacción de Mercado Pago falla)

            throw new HttpException(
              error.response?.data || 'Error desconocido',
              error.response?.status || 500
            );
          })
        );
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new HttpException('Error al procesar el pago', 500);
    }
  }

  private simplifyPaymentResponse(response: PaymentResponse): SimplifiedPaymentResponse {
    const simplified = {
      id: response.id,
      status: response.status,
      transaction_amount: response.transaction_amount,
      payment_method_id: response.payment_method_id,
      payer: { email: response.payer.email },
    };
    console.log('Respuesta simplificada:', simplified);
    return simplified;
  }
}
