import { v4 as uuidv4 } from 'uuid';
export const MERCADO_PAGO_API = 'https://api.mercadopago.com/v1';
export const MERCADO_PAGO_HEADERS = {
  Authorization: 'Bearer TEST-6389675485446272-112016-18bc1d6cb16b8124d2c894d45a33f14f-639847327',
  'Content-Type': 'application/json',
  'X-Idempotency-Key': uuidv4(),
};

export const API = 'localhost'; //cambiar cunado se suba a produccion
