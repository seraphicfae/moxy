const { PREFIX } = require("../utils/config.json");
const handleCommand = require("../utils/handler.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    await handleCommand({ context: message, client, args, type: "message" });
  },
};
