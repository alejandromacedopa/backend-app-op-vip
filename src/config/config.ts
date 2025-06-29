import { v4 as uuidv4 } from 'uuid';
export const MERCADO_PAGO_API = 'https://api.mercadopago.com/v1';
export const MERCADO_PAGO_HEADERS = {
  Authorization: 'Bearer TEST-6220138623807480-112503-34a9f33417c3055570c29085b66d2aad-752500562',
  'Content-Type': 'application/json',
  'X-Idempotency-Key': uuidv4(),
};

export const API = 'localhost'; //cambiar cunado se suba a produccion
