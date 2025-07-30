const { Collection } = require("discord.js");
const { PREFIX, OWNER_ID } = require("./config.json");

const cooldowns = new Collection();

async function handleCommand({ context, client, args, type }) {
  const user = context.user?.id ?? context.author?.id;
  const commandName =
    type === "message" ? args.shift().toLowerCase() : context.commandName;

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases?.includes(commandName));

  if (!command) return;

  if (command.owner_only && user !== OWNER_ID) {
    const replyContent = "This is owner‑only.";
    return type === "message"
      ? context.reply(replyContent)
      : context.reply({ content: replyContent });
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownSec = command.cooldown ?? 1;
  const cooldownMs = cooldownSec * 1000;

  if (timestamps.has(user)) {
    const expireTime = timestamps.get(user) + cooldownMs;
    if (now < expireTime) {
      const ts = Math.floor(expireTime / 1000);
      const replyContent =
        type === "message"
          ? `On cooldown. You can use it again <t:${ts}:R>.`
          : { content: `On cooldown. Try again <t:${ts}:R>.` };
      return context.reply(replyContent);
    }
  }

  timestamps.set(user, now);
  setTimeout(() => timestamps.delete(user), cooldownMs);

  try {
    if (type === "message" && command.executeMessage) {
      await command.executeMessage(context, args);
    } else if (type === "interaction" && command.executeInteraction) {
      await command.executeInteraction(context);
    }
  } catch (err) {
    console.error(err);
    const errorReply =
      type === "message"
        ? "Error executing that command."
        : { content: "Error executing command." };

    if (type === "interaction" && (context.replied || context.deferred)) {
      await context.followUp(errorReply);
    } else {
      await context.reply(errorReply);
    }
  }
}

module.exports = handleCommand;
