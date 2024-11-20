export class CreateOrderDto {
    id_client: number;
    id_address: number;
    // status?: string = "PAGADO";
    products: Array< { id: number; quantity: number; } >
}