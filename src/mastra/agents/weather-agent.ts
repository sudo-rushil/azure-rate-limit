import dotenv from "dotenv";
dotenv.config();

import { createAnthropic } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";

// Create a custom fetch that logs all headers
const loggingFetch: typeof fetch = async (url, init) => {
  console.log("\n=== OUTGOING REQUEST ===");
  console.log("URL: [AZURE_ENDPOINT]");
  console.log("Method:", init?.method || "GET");
  console.log("Request Headers:", JSON.stringify(init?.headers, null, 2));
  console.log("Timestamp:", new Date().toISOString());

  const response = await fetch(url, init);

  console.log("\n=== INCOMING RESPONSE ===");
  console.log("Status:", response.status, response.statusText);
  console.log("Response Headers:");
  response.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log("Timestamp:", new Date().toISOString());

  return response;
};

const anthropic = createAnthropic({
  apiKey: process.env.AZURE_API_KEY,
  baseURL: process.env.AZURE_ENDPOINT,
  fetch: loggingFetch,
});

export const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions: `
      You are a helpful weather assistant that provides accurate weather information and can help planning activities based on the weather.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative
      - If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
      - If the user asks for activities, respond in the format they request.

      Use the weatherTool to fetch current weather data.
`,
  model: anthropic("claude-sonnet-4-5"),
  tools: { weatherTool },
});
