import { v4 as uuidv4 } from 'uuid';
export const MERCADO_PAGO_API = 'https://api.mercadopago.com/v1';
export const MERCADO_PAGO_HEADERS = {
    'Authorization': 'Bearer TEST-1031364137403782-111816-3ea5c6f8324a12dca777b1be5108f35f-639847327',
    'Content-Type': 'application/json',
    'X-Idempotency-Key': uuidv4()

}



export const API = "192.168.246.1";