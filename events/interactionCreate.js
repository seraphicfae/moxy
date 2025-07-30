const handleCommand = require("../utils/handler.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    await handleCommand({
      context: interaction,
      client,
      args: [],
      type: "interaction",
    });
  },
};
