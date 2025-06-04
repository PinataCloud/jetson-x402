import OpenAI from "openai";
import { Message } from "./types";

const client = new OpenAI({
  baseURL: "http://localhost:11434/v1/",
  apiKey: "ollama",
});

export const chatCompletion = async (
  controller: ReadableStreamDefaultController | null,
  messages: Message[],
  model: string,
  stream?: boolean
) => {
  try {
    const completion = await client.chat.completions.create({
      model: model,
      messages: messages,
      stream: stream ? stream : false,
    });

    if (stream && controller) {
      try {
        // Process the streaming response
        // @ts-expect-error the completion is appropriate when stream is true
        for await (const chunk of completion) {
          if (chunk.choices && chunk.choices.length > 0) {
            // Send the chunk in OpenAI format, not SSE format
            const chunkString = JSON.stringify(chunk) + '\n';
            controller.enqueue(new TextEncoder().encode(chunkString));
          }
        }
        // Send the final [DONE] marker in OpenAI format
        controller.enqueue(new TextEncoder().encode('[DONE]\n'));
      } catch (error: any) {
        console.error("Error in AI chat:", error);
        // Send error as a proper OpenAI chunk
        const errorChunk = {
          choices: [{
            delta: {
              content: `Error: ${error.message || 'An error occurred'}`
            }
          }]
        };
        controller.enqueue(new TextEncoder().encode(JSON.stringify(errorChunk) + '\n'));
        controller.enqueue(new TextEncoder().encode('[DONE]\n'));
      }
    } else {
      return completion;
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};
