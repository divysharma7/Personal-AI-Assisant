/**
 * Alexa response builder helpers.
 * Builds properly formatted JSON responses with SSML speech output.
 */

export interface AlexaResponse {
  version: string
  response: {
    outputSpeech: { type: 'SSML'; ssml: string }
    card?: { type: 'Simple'; title: string; content: string }
    shouldEndSession: boolean
  }
}

export function alexaResponse(speechText: string, shouldEnd = true): AlexaResponse {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: `<speak>${speechText}</speak>`,
      },
      shouldEndSession: shouldEnd,
    },
  }
}

export function alexaCard(title: string, content: string, speechText: string): AlexaResponse {
  return {
    version: '1.0',
    response: {
      outputSpeech: { type: 'SSML', ssml: `<speak>${speechText}</speak>` },
      card: { type: 'Simple', title, content },
      shouldEndSession: true,
    },
  }
}
