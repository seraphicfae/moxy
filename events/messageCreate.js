const { PREFIX, OWNER_ID } = require("../utils/config.json");
const { Collection } = require("discord.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
      );

    if (!command) return;

    if (command.owner_only && message.author.id !== OWNER_ID) {
      return message.reply("This is an owner-only command.");
    }

    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const defaultCooldown = 1;
    const cooldownAmount = (command.cooldown ?? defaultCooldown) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const expireTimestampSeconds = Math.floor(expirationTime / 1000);
        return message.reply(
          `You are on cooldown. You can ${cmd.name} again <t:${expireTimestampSeconds}:R>.`,
        );
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply("There was an error executing that command.");
    }
  },
};
