import Anthropic from "@anthropic-ai/sdk";
import { TracifyClient, wrapAnthropic, traceTools, span } from "tracify-sdk";

const tracify = new TracifyClient({ environment: "development" });
const anthropic = wrapAnthropic(new Anthropic(), { client: tracify });
const tools = traceTools({ getWeather: async (city: string) => `Sunny in ${city}` }, { client: tracify });

async function main() {
  await span("weather-agent", async () => {
    const weather = await tools.getWeather("Oslo");
    const reply = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: `Say this nicely: ${weather}` }],
    });
    console.log(reply.content);
  });
}
main();
