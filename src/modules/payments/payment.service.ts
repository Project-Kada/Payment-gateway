// src/modules/payments/payment.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RazorpayService } from './razorpay.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
    constructor(
        private razorpayService: RazorpayService,
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async createOrder(createOrderDto: CreateOrderDto) {
        const razorpay = this.razorpayService.getInstance();

        const options = {
            amount: createOrderDto.amount * 100,
            currency: createOrderDto.currency,
            receipt: createOrderDto.receipt,
            payment_capture: 1,
            notes: createOrderDto.notes,
        };

        try {
            const order = await razorpay.orders.create(options);
            return {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                created_at: order.created_at,
            };
        } catch (error) {
            throw new Error(`Failed to create Razorpay order: ${error.message}`);
        }
    }

    async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
        const crypto = require('crypto');
        const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(verifyPaymentDto.order_id + '|' + verifyPaymentDto.payment_id)
            .digest('hex');

        if (expectedSignature !== verifyPaymentDto.signature) {
            throw new Error('Payment verification failed');
        }

        return { verified: true };
    }

    async getOrderStatus(orderId: string) {
        const cacheKey = `order_status_${orderId}`;
        const cachedStatus = await this.cacheManager.get(cacheKey);

        if (cachedStatus) {
            return cachedStatus;
        }

        const razorpay = this.razorpayService.getInstance();
        const order = await razorpay.orders.fetch(orderId);

        await this.cacheManager.set(cacheKey, order.status, 5000); // Cache for 5 seconds

        return order.status;
    }

    async verifyWebhookSignature(body: any, signature: string) {
        return this.razorpayService.verifyWebhookSignature(body, signature);
    }
}