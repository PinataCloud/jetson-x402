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
        //  @ts-expect-error the completion is appropriate when stream is true
        for await (const chunk of completion) {
          if (chunk.choices && chunk.choices.length > 0) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              // Send the chunk as a Server-Sent Event
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
          }
        }

        // Send an event to indicate the stream is complete
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      } catch (error: any) {
        // Handle errors by sending them to the claudeClient
        console.error("Error in AI chat:", error);

        // Create a user-friendly error message
        let errorMessage = "An error occurred while processing your request.";

        if (error.code === "overloaded_error") {
          errorMessage =
            "OpenAI servers are currently overloaded. Please try again in a few moments.";
        } else if (error.message) {
          // Use the error message from the API if available
          errorMessage = `Error: ${error.message}`;
        }

        // Send the error to the claudeClient
        const errorData = `data: ${JSON.stringify({
          error: true,
          message: errorMessage,
          code: error.code || "unknown_error",
        })}\n\n`;

        controller.enqueue(new TextEncoder().encode(errorData));
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      }
    } else {
        return completion;
    }
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};
