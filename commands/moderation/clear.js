const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "clear",
  description: "Deletes up to 99 messages.",
  usage: "clear <num>",
  category: "moderation",
  aliases: ["prune"],
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Deletes up to 99 messages.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-99)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(99),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // message cmd
  async executeMessage(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply(
        "You need the Manage Messages permission to use this command.",
      );
    }

    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 99) {
      return message.reply("Enter a number between 1 and 99.");
    }

    const deleted = await message.channel
      .bulkDelete(amount, true)
      .catch(() => null);
    const count = deleted ? deleted.size : 0;
    const reply = await message.channel.send(
      `Cleared ${count} message${count !== 1 ? "s" : ""}.`,
    );
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  },

  // slash cmd
  async executeInteraction(interaction) {
    if (
      !interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply(
        "You need the Manage Messages permission to use this command.",
      );
    }

    const amount = interaction.options.getInteger("amount");

    if (!amount || amount < 1 || amount > 99) {
      return interaction.reply("Enter a number between 1 and 99.");
    }

    const deleted = await interaction.channel
      .bulkDelete(amount, true)
      .catch(() => null);
    const count = deleted ? deleted.size : 0;
    await interaction.reply(
      `Cleared ${count} message${count !== 1 ? "s" : ""}.`,
    );
  },
};
