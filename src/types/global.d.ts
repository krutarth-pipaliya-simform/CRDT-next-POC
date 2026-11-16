import type { Transporter } from "nodemailer";
import type Stripe from "stripe";

import type { AppPrismaClient } from "@/lib/db";
import type { NotificationBus } from "@/lib/notification-bus";

declare global {
    var prisma: AppPrismaClient | undefined;
    var nodemailerTransporter: Transporter | undefined;
    var notificationBus: NotificationBus | undefined;
    var stripeClient: Stripe | undefined;
}

export {};
