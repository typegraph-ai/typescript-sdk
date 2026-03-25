import type { GongRawUser } from '../types.js'
import type { GongUser } from '../models.js'

/**
 * Transform a raw Gong API user into a normalized GongUser.
 */
export function toGongUser(raw: GongRawUser): GongUser {
  return {
    id: raw.id,
    emailAddress: raw.emailAddress,
    firstName: raw.firstName ?? undefined,
    lastName: raw.lastName ?? undefined,
    title: raw.title ?? undefined,
  }
}
