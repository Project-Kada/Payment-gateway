import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
    @IsNotEmpty()
    @IsString()
    order_id: string;

    @IsNotEmpty()
    @IsString()
    payment_id: string;

    @IsNotEmpty()
    @IsString()
    signature: string;
}