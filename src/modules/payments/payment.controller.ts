// src/modules/payments/payment.controller.ts
import { Controller, Post, Body, Get, Param, Headers, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RazorpayService } from './razorpay.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService,
        private readonly razorpayService: RazorpayService,) { }

    @Post('create-order')
    @ApiOperation({ summary: 'Create a new payment order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.paymentService.createOrder(createOrderDto);
    }

    @Post('verify')
    @ApiOperation({ summary: 'Verify a payment' })
    @ApiResponse({ status: 200, description: 'Payment verified' })
    @ApiResponse({ status: 400, description: 'Verification failed' })
    async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
        return this.paymentService.verifyPayment(verifyPaymentDto);
    }

    @Get('order-status/:orderId')
    @ApiOperation({ summary: 'Get order status' })
    @ApiResponse({ status: 200, description: 'Order status retrieved' })
    async getOrderStatus(@Param('orderId') orderId: string) {
        return this.paymentService.getOrderStatus(orderId);
    }

    @Post('webhook')
    @HttpCode(200)
    @ApiHeader({ name: 'x-razorpay-signature', required: true })
    @ApiOperation({ summary: 'Handle Razorpay webhook events' })
    async handleWebhook(
        @Body() body: any,
        @Headers('x-razorpay-signature') signature: string,
    ) {
        const isValid = this.paymentService.verifyWebhookSignature(body, signature);

        if (!isValid) {
            throw new Error('Invalid webhook signature');
        }

        // Process different event types
        switch (body.event) {
            case 'payment.captured':
                console.log('Payment captured:', body.payload.payment.entity);
                break;
            case 'payment.failed':
                console.log('Payment failed:', body.payload.payment.entity);
                break;
            default:
                console.log('Unhandled event:', body.event);
        }

        return { status: 'ok' };
    }
}