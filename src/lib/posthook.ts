/**
 * Stub — the original posthook module was lost.
 * Provides no-op notification scheduling so API routes compile.
 */

export async function scheduleNotification(
  _payload: Record<string, unknown>
): Promise<{ id?: string }> {
  console.warn('[posthook] scheduleNotification stub called — no-op')
  return {}
}

export async function cancelNotification(
  _id: string
): Promise<void> {
  console.warn('[posthook] cancelNotification stub called — no-op')
}
