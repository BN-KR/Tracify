from anthropic import Anthropic
import tracify

client = tracify.wrap_anthropic(Anthropic())
tools = tracify.trace_tools({"get_weather": lambda city: f"Sunny in {city}"})


@tracify.trace_agent(name="weather-agent")
def main():
    weather = tools["get_weather"]("Oslo")
    reply = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=200,
        messages=[{"role": "user", "content": f"Say this nicely: {weather}"}],
    )
    print(reply.content[0].text)


main()
