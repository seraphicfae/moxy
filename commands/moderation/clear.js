const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

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

    await safeBulkDelete(message.channel, amount, async (msg) => {
      const reply = await message.channel.send(msg);
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    });
  },

  // slash cmd
  async executeInteraction(interaction) {
    if (
      !interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content: "You need the Manage Messages permission to use this command.",
        ephemeral: true,
      });
    }

    const amount = interaction.options.getInteger("amount");

    if (!amount || amount < 1 || amount > 99) {
      return interaction.reply({
        content: "Enter a number between 1 and 99.",
        ephemeral: true,
      });
    }

    await safeBulkDelete(interaction.channel, amount, async (msg) => {
      await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
    });
  },
};

// Disocrd API such good!
async function safeBulkDelete(channel, amount, sendFeedback) {
  try {
    const deleted = await channel.bulkDelete(amount, true);
    const deletedCount = deleted.size;

    let message = `Deleted ${deletedCount} messages.`;
    if (deletedCount < amount) {
      message += ` Some messages weren't deleted: older than 14 days.`;
    }

    await sendFeedback(message);
  } catch (err) {
    console.error("Bulk delete failed:", err);
    await sendFeedback("Failed to delete messages due to an unexpected error.");
  }
}
