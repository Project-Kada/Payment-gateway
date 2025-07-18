import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || 'default_test_key',
        keySecret: process.env.RAZORPAY_KEY_SECRET || 'default_test_secret',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'default_test_secretssss',
    },
}));