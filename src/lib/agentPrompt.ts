/**
 * Stub — the original agentPrompt module was lost.
 * Provides a basic system prompt builder for the chat API.
 */
export function buildSystemPrompt(
  localDate?: string,
  timezone?: string,
): string {
  const dateInfo = localDate ? ` The current local date is ${localDate}.` : ''
  const tzInfo = timezone ? ` The user's timezone is ${timezone}.` : ''
  return `You are LAIF, a helpful life management assistant.${dateInfo}${tzInfo}`
}
