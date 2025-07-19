/**
 * Type definitions for Prisma models with extended fields
 * This file augments the Prisma client types with our custom fields
 */

import { Prisma } from '@prisma/client';

// Extend the Invite model with our new fields
declare global {
  namespace PrismaJson {
    // Extend the Invite model
    interface InviteCreateInput extends Prisma.InviteCreateInput {
      friendFirstName?: string;
      trustedAdultContact?: string;
      inviteType?: string;
      inviteNote?: string;
    }

    interface InviteUpdateInput extends Prisma.InviteUpdateInput {
      friendFirstName?: string | Prisma.StringFieldUpdateOperationsInput | null;
      trustedAdultContact?: string | Prisma.StringFieldUpdateOperationsInput | null;
      inviteType?: string | Prisma.StringFieldUpdateOperationsInput | null;
      inviteNote?: string | Prisma.StringFieldUpdateOperationsInput | null;
    }

    interface Invite extends Prisma.Invite {
      friendFirstName?: string | null;
      trustedAdultContact?: string | null;
      inviteType?: string | null;
      inviteNote?: string | null;
    }
  }
}

// Export the extended types
export {};
