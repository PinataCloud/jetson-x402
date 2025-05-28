import { Hono } from 'hono'
import { paymentMiddleware } from "x402-hono"

const app = new Hono().basePath('/v1')

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
  const ollamaRes = await fetch('http://localhost:11434/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const ollamaData = await ollamaRes.json()
  console.log(ollamaData)
  return c.json(ollamaData)
})


export default app
