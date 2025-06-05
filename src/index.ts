import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { paymentMiddleware } from "x402-hono"
import { chatCompletion } from './utils/ai';
import { facilitator } from "@coinbase/x402";

const app = new Hono().basePath('/v1')

app.use(cors());

app.use(paymentMiddleware(
  "0xc900f41481B4F7C612AF9Ce3B1d16A7A1B6bd96E",
  {
    "/v1/chat/completions": {
      price: "$0.001",
      network: "base",
      config: {
        description: "Access to premium content",
      }
    }
  },
  facilitator
));

app.get('/', (c) => {
  return c.text('Pay to Prompt')
})

app.post("/chat/completions", async (c) => {
  const body = await c.req.json();
  console.log(body);

  if (body.stream) {
    // Set headers for OpenAI streaming format, not SSE
    c.header("Content-Type", "text/plain");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await chatCompletion(
            controller,
            body.messages,
            body.model,
            body.stream
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    return c.body(stream);
  }

  const completion = await chatCompletion(null, body.messages, body.model, false);
  return c.json(completion);
});


export default app
