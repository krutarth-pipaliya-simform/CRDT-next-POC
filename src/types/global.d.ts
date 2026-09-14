import type { Transporter } from "nodemailer";

import type { AppPrismaClient } from "@/lib/db";
import type { NotificationBus } from "@/lib/notification-bus";

declare global {
    var prisma: AppPrismaClient | undefined;
    var nodemailerTransporter: Transporter | undefined;
    var notificationBus: NotificationBus | undefined;
}

export {};
