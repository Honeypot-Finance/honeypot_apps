import { publicProcedure, rateLimitMiddleware, router } from '../trpc';
import z from 'zod';
import { userContactsService } from '../service/userContacts';

export const userContactsRouter = router({
  /**
   * Create a new contact entry
   * Rate limited to prevent spam
   */
  createContact: publicProcedure
    .use(rateLimitMiddleware({ limit: 10, duration: 60000 })) // 10 requests per minute
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return userContactsService.createContact(input);
    }),

  /**
   * Create or update contact by email (useful for waitlist signups)
   * Rate limited to prevent spam
   */
  upsertContactByEmail: publicProcedure
    .use(rateLimitMiddleware({ limit: 5, duration: 60000 })) // 5 requests per minute
    .input(
      z.object({
        email: z.string().email(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return userContactsService.upsertContactByEmail(input);
    }),

  /**
   * Check if email already exists
   * Useful for client-side validation
   */
  emailExists: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      return userContactsService.emailExists(input.email);
    }),

  /**
   * Get contact by email
   * This might need auth in production
   */
  getContactByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      return userContactsService.getContactByEmail(input.email);
    }),

  /**
   * Get all contacts with pagination
   * This should be protected with authProcedure in production
   */
  getAllContacts: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return userContactsService.getAllContacts(input);
    }),
});
