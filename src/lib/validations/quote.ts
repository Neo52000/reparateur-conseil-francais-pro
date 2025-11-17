import { z } from 'zod';

export const quoteRequestSchema = z.object({
  deviceBrand: z.string()
    .trim()
    .min(1, { message: "La marque est requise" })
    .max(50, { message: "La marque ne peut pas dépasser 50 caractères" }),
  
  deviceModel: z.string()
    .trim()
    .min(1, { message: "Le modèle est requis" })
    .max(100, { message: "Le modèle ne peut pas dépasser 100 caractères" }),
  
  issueType: z.string()
    .trim()
    .min(1, { message: "Le type de problème est requis" })
    .max(100, { message: "Le type de problème ne peut pas dépasser 100 caractères" }),
  
  issueDescription: z.string()
    .trim()
    .min(10, { message: "La description doit contenir au moins 10 caractères" })
    .max(1000, { message: "La description ne peut pas dépasser 1000 caractères" }),
  
  contactName: z.string()
    .trim()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" }),
  
  contactEmail: z.string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "L'email ne peut pas dépasser 255 caractères" }),
  
  contactPhone: z.string()
    .trim()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, { message: "Numéro de téléphone invalide" })
    .optional(),
  
  preferredContact: z.enum(['email', 'phone'], {
    errorMap: () => ({ message: "Mode de contact invalide" })
  })
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Le message ne peut pas être vide" })
    .max(2000, { message: "Le message ne peut pas dépasser 2000 caractères" }),
  
  recipientId: z.string().uuid({ message: "ID destinataire invalide" })
});

export type MessageInput = z.infer<typeof messageSchema>;

export const paymentSchema = z.object({
  cardholderName: z.string()
    .trim()
    .min(2, { message: "Le nom du titulaire doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Nom invalide" }),
  
  cardNumber: z.string()
    .trim()
    .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, { message: "Numéro de carte invalide" }),
  
  expiry: z.string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Date d'expiration invalide (MM/AA)" }),
  
  cvc: z.string()
    .trim()
    .regex(/^\d{3}$/, { message: "CVC invalide (3 chiffres)" })
});

export type PaymentInput = z.infer<typeof paymentSchema>;
