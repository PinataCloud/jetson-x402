import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { paymentMiddleware } from "x402-hono"
import { chatCompletion } from './utils/ai';

const app = new Hono().basePath('/v1')

app.use(cors())

app.use(paymentMiddleware(
  "0xc900f41481B4F7C612AF9Ce3B1d16A7A1B6bd96E",
  {
    "/v1/chat/completions": {
      price: "$0.10",
      network: "base-sepolia",
      config: {
        description: "Access to premium content",
      }
    }
  },
  {
    url: "https://x402.org/facilitator", // Facilitator URL for Base Sepolia testnet.
  }
));

app.get('/', (c) => {
  return c.text('Pay to Prompt')
})

app.post("/chat/completions", async (c) => {
  const body = await c.req.json()
  console.log(body)

  if (body.stream) {
    // Set up streaming response
    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    // Create a new readable stream
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
  return c.json(completion)
}
})


export default app
