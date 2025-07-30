const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "ban",
  description: "Bans a user from the server.",
  usage: "ban <@user|userID> [reason]",
  category: "moderation",
  aliases: ["🍌"],
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to ban").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the ban")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  // message cmd
  async executeMessage(message, args) {
    // logic
  },

  // slash cmd
  async executeInteraction(interaction) {
    // logic
  },
};
