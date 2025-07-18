// src/config/razorpay.config.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService implements OnModuleInit {
    public instance: any;
    private readonly key: string;
    private readonly secret: string;
    private readonly webhookSecret: string;
    private readonly environment: string;

    constructor(private configService: ConfigService) {
        this.key = this.configService.get<string>('RAZORPAY_KEY_ID');
        this.secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
        this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
        this.environment = this.configService.get<string>('RAZORPAY_ENVIRONMENT');

        this.validateConfig();
    }

    onModuleInit() {
        this.initializeRazorpay();
    }

    private validateConfig(): void {
        if (!this.key || !this.secret) {
            throw new Error('Razorpay credentials not configured');
        }

        console.log('Razorpay Config:');
        console.log('Key:', this.key ? '****' + this.key.slice(-4) : 'Not set');
        console.log('Environment:', this.environment || 'Not set');
    }

    private initializeRazorpay(): void {
        try {
            this.instance = new Razorpay({
                key_id: this.key,
                key_secret: this.secret,
            });
            console.log('Razorpay instance initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Razorpay:', error);
            throw error;
        }
    }

    public getInstance() {
        if (!this.instance) {
            throw new Error('Razorpay instance not initialized');
        }
        return this.instance;
    }

    public verifyWebhookSignature(body: any, signature: string): boolean {
        if (!this.webhookSecret) {
            throw new Error('Webhook secret not configured');
        }

        try {
            const generatedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(JSON.stringify(body))
                .digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(generatedSignature),
                Buffer.from(signature)
            );
        } catch (error) {
            console.error('Error verifying webhook signature:', error);
            return false;
        }
    }
}