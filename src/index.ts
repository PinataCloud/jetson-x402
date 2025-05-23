import { Hono } from 'hono'
import { paymentMiddleware } from "x402-hono"

const app = new Hono()

app.use(paymentMiddleware(
  "0xaD73eafCAc4F4c6755DFc61770875fb8B6bC8A25", // your receiving wallet address
  {  // Route configurations for protected endpoints
    "/generate": {
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

app.post("/generate", async (c) => {
  const body = await c.req.json()
  console.log(body)
  const ollamaRes = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: body.prompt,
      stream: false
    })
  });

  const ollamaData = await ollamaRes.json()
  console.log(ollamaData)
  return c.json(ollamaData)
})

export default app
