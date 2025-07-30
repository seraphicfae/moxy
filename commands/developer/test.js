const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  name: "test",
  description: "Debugging and testing tool.",
  usage: "test [function]",
  category: "developer",
  aliases: ["testing", "meow"],
  owner_only: true,
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Debugging and testing tool.")
    .setContexts(
      InteractionContextType.PrivateChannel,
      InteractionContextType.Guild,
    ),

  // message cmd
  async executeMessage(message) {
    await message.channel.send("Executed");
  },

  // slash cmd
  async executeInteraction(interaction) {
    const sent = await interaction.reply({
      content: `Pinging...`,
      withRespone: true,
      flags: MessageFlags.Ephemeral,
    });

    await interaction.editReply(
      `Websocket heartbeat: ${interaction.client.ws.ping}ms\nRound-trip latency: ${Date.now() - interaction.createdTimestamp}ms`,
    );
  },
};
