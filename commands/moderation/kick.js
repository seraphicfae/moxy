const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "kick",
  description: "Kicks a user from the server.",
  usage: "kick <@user|userID> [reason]",
  category: "moderation",
  aliases: ["🦶"],
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to kick").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the kick")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  // message cmd
  async executeMessage(message, args) {
    // logic
  },

  // slash cmd
  async executeInteraction(interaction) {
    // logic
  },
};
