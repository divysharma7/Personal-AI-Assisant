/**
 * Stub — the original firebase-admin module was lost.
 * Provides a no-op Firebase admin setup so API routes compile.
 */
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    })
  } catch {
    // Firebase credentials not configured — silent fallback
  }
}

export default admin

/** Firebase Cloud Messaging — exported as a callable function matching original API */
export function messaging(): admin.messaging.Messaging {
  if (admin.apps.length) return admin.messaging()
  return {
    send: async () => '',
    sendEachForMulticast: async () => ({ successCount: 0, failureCount: 0, responses: [] }),
  } as unknown as admin.messaging.Messaging
}

/** Firebase Realtime Database — exported as a callable function matching original API */
export function rtdb(): admin.database.Database {
  if (admin.apps.length) return admin.database()
  return {
    ref: (_path?: string) => ({
      push: () => ({ key: null, set: async () => {} }),
      set: async () => {},
      once: async () => ({ val: () => null, exists: () => false, forEach: () => false }),
      orderByChild: () => ({
        startAt: () => ({
          once: async () => ({ val: () => null, exists: () => false, forEach: () => false }),
        }),
        startAfter: () => ({
          once: async () => ({ val: () => null, exists: () => false, forEach: () => false }),
        }),
        endAt: () => ({
          once: async () => ({ val: () => null, exists: () => false, forEach: () => false }),
        }),
        endBefore: () => ({
          once: async () => ({ val: () => null, exists: () => false, forEach: () => false }),
        }),
      }),
      remove: async () => {},
      update: async () => {},
    }),
  } as unknown as admin.database.Database
}

export async function sendPushNotification(
  _token: string,
  _title: string,
  _body: string,
): Promise<void> {
  console.warn('[firebase-admin] sendPushNotification stub — no-op')
}
