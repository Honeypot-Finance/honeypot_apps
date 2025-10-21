import { pg } from '@/lib/db';

export interface UserContactColumn {
  id: number;
  email?: string;
  phone?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const userContactsService = {
  /**
   * Create a new user contact entry
   * @param data - Contact information (email and/or phone)
   * @returns The created contact record
   */
  createContact: async (data: {
    email?: string;
    phone?: string;
  }): Promise<UserContactColumn> => {
    if (!data.email && !data.phone) {
      throw new Error('At least one contact method (email or phone) is required');
    }

    // Validate email format if provided
    if (data.email && !isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    const result = await pg<UserContactColumn[]>`
      INSERT INTO user_contacts ${pg({
        email: data.email?.toLowerCase() || null,
        phone: data.phone || null,
      })}
      RETURNING *
    `;

    return result[0];
  },

  /**
   * Create or update user contact (upsert based on email)
   * Useful when you want to avoid duplicates by email
   */
  upsertContactByEmail: async (data: {
    email: string;
    phone?: string;
  }): Promise<UserContactColumn> => {
    if (!isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    const result = await pg<UserContactColumn[]>`
      INSERT INTO user_contacts ${pg({
        email: data.email.toLowerCase(),
        phone: data.phone || null,
      })}
      ON CONFLICT (email)
      DO UPDATE SET
        phone = EXCLUDED.phone,
        updated_at = NOW()
      RETURNING *
    `;

    return result[0];
  },

  /**
   * Get contact by email
   */
  getContactByEmail: async (email: string): Promise<UserContactColumn | null> => {
    const result = await pg<UserContactColumn[]>`
      SELECT * FROM user_contacts
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    return result.length > 0 ? result[0] : null;
  },

  /**
   * Get contact by ID
   */
  getContactById: async (id: number): Promise<UserContactColumn | null> => {
    const result = await pg<UserContactColumn[]>`
      SELECT * FROM user_contacts
      WHERE id = ${id}
      LIMIT 1
    `;

    return result.length > 0 ? result[0] : null;
  },

  /**
   * Get all contacts (with pagination)
   */
  getAllContacts: async (options?: {
    limit?: number;
    offset?: number;
  }): Promise<UserContactColumn[]> => {
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;

    return pg<UserContactColumn[]>`
      SELECT * FROM user_contacts
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  },

  /**
   * Check if email already exists
   */
  emailExists: async (email: string): Promise<boolean> => {
    const result = await pg<{ count: string }[]>`
      SELECT COUNT(*) as count
      FROM user_contacts
      WHERE email = ${email.toLowerCase()}
    `;

    return Number(result[0].count) > 0;
  },

  /**
   * Delete contact by ID
   */
  deleteContact: async (id: number): Promise<boolean> => {
    const result = await pg`
      DELETE FROM user_contacts
      WHERE id = ${id}
      RETURNING id
    `;

    return result.length > 0;
  },
};

/**
 * Email validation helper
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
