import type { Transporter } from "nodemailer";

import type { AppPrismaClient } from "@/lib/db";

declare global {
    var prisma: AppPrismaClient | undefined;
    var nodemailerTransporter: Transporter | undefined;
}

export {};
