import { publicProcedure, router } from '../trpc';
import z from 'zod';
import { userContactsService } from '../service/userContacts';

/**
 * User Contacts Router for Wasabee
 * Handles waitlist signups and contact information collection
 */
export const userContactsRouter = router({
  /**
   * Submit waitlist signup (for Perp feature)
   * This uses upsert to prevent duplicate emails
   */
  submitWaitlist: publicProcedure
    .input(
      z.object({
        email: z.string().email('Please enter a valid email address'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const contact = await userContactsService.upsertContactByEmail({
          email: input.email,
        });

        return {
          success: true,
          message: 'Successfully joined the waitlist!',
          contactId: contact.id,
        };
      } catch (error: any) {
        console.error('Error submitting waitlist:', error);
        throw new Error(
          error.message || 'Failed to submit waitlist. Please try again.'
        );
      }
    }),

  /**
   * Create contact with both email and phone
   */
  createContact: publicProcedure
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
   * Check if email already exists in waitlist
   */
  checkEmailExists: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      return userContactsService.emailExists(input.email);
    }),
});
