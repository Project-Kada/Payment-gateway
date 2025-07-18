// src/modules/payments/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { RazorpayService } from './razorpay.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [ConfigModule, CacheModule.register()],
    controllers: [PaymentController],
    providers: [PaymentService, RazorpayService],
    exports: [RazorpayService],
})
export class PaymentModule { }