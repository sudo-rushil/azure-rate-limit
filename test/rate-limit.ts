import { mastra } from "../src/mastra";

async function test() {
	const agent = mastra.getAgent("weatherAgent");

	console.log(`Starting run: ${new Date().toISOString()}`);
	const response = await agent.generate(
		"Retrieve the weather in San Francisco",
	);

	console.log(response.text);
	console.log(`Finishing run: ${new Date().toISOString()}`);
}

test();
