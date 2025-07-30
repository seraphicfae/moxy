const {
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  name: "ping",
  description: "Shows the bot's ping.",
  usage: "ping",
  category: "utility",
  aliases: ["pong"],
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the bot's ping.")
    .setContexts(
      InteractionContextType.PrivateChannel,
      InteractionContextType.Guild,
    ),

  // message cmd
  async executeMessage(message) {
    const sent = await message.channel.send("Pinging...");
    await sent.edit(
      `Pong! Roundtrip latency: **${Date.now() - message.createdTimestamp}ms** Websocket heartbeat: **${message.client.ws.ping}ms**`,
    );
  },

  // slash cmd
  async executeInteraction(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      withResponse: true,
    });

    interaction.editReply(
      `Pong! Latency: **${Date.now() - interaction.createdTimestamp}ms** Websocket heartbeat: **${interaction.client.ws.ping}ms**`,
    );
  },
};
