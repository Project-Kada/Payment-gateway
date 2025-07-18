import { IsNotEmpty, IsNumber, IsString, IsIn, Min } from 'class-validator';

export class CreateOrderDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    amount: number;

    @IsString()
    @IsIn(['INR'])
    currency: string = 'INR';

    @IsString()
    @IsNotEmpty()
    receipt: string;

    notes?: Record<string, string>;
}