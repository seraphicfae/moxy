const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "mute",
  description: "Mutes a user from the server.",
  usage: "Mute <@user|userID> [reason]",
  category: "moderation",
  aliases: ["timeout"],
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a user from the server.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to mute").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the mute")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  // message cmd
  async executeMessage(message, args) {
    // logic
  },

  // slash cmd
  async executeInteraction(interaction) {
    // logic
  },
};
