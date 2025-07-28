module.exports = {
  name: "ping",
  description: "Shows the bot's ping.",
  usage: "ping",
  category: "utility",
  aliases: ["pong"],
  async execute(message) {
    const sent = await message.channel.send("Pinging...");
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiPing = Math.round(message.client.ws.ping);

    sent.edit(`Pong! Latency: ${latency}ms | API Latency: ${apiPing}ms`);
  },
};
