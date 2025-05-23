import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { account } from "./viem";

const fetchWithPayment = wrapFetchWithPayment(fetch, account);

const url = "http://localhost:3000/v1/chat/completions";

async function main() {
  const response = await fetchWithPayment(url, {
    method: "POST",
    body: JSON.stringify({
      model: "llama3.2",
      messages: [
        {
          "role": "user",
          "content": "Write a one-sentence bedtime story about a unicorn."
        }
      ]
    }),
  })

  if (!response.ok) {
    const message = await response.text();
    console.log(message);
  }
  const body = await response.json();
  console.log(body);
}

main()
