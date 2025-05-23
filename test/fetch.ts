import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { account } from "./viem";

const fetchWithPayment = wrapFetchWithPayment(fetch, account);

const url = "http://localhost:3000/generate";

async function main() {
  const response = await fetchWithPayment(url, {
    //url should be something like https://api.example.com/paid-endpoint
    method: "POST",
    body: JSON.stringify({
      prompt: "why is the sky blue?",
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
