import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateOrderDto {
    @IsNotEmpty()
    @IsNumber()
    id_client: number;

    @IsNotEmpty()
    @IsNumber()
    id_address: number;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsArray()
    products: Array<{ id: number; quantity: number }>;
}