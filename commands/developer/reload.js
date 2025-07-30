const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const walkSync = (dir) => {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walkSync(filePath));
    } else if (file.endsWith(".js")) {
      results.push(filePath);
    }
  });
  return results;
};

async function reloadCommands(client) {
  const commandsPath = path.join(process.cwd(), "commands");
  const files = walkSync(commandsPath);
  let success = 0;
  const failed = [];

  for (const file of files) {
    try {
      const reqPath = require.resolve(file);
      delete require.cache[reqPath];
      const newCommand = require(reqPath);

      if (
        !newCommand.name ||
        (!newCommand.executeMessage && !newCommand.executeInteraction)
      ) {
        throw new Error("Invalid command format");
      }

      client.commands.set(newCommand.name, newCommand);
      success++;
    } catch (err) {
      console.error(`Reload failed for ${file}:`, err);
      failed.push(`${path.relative(commandsPath, file)} → ${err.message}`);
    }
  }

  return new EmbedBuilder()
    .setColor("#FFC0CB")
    .setTitle("Reloaded Commands")
    .setDescription(
      `Success: ${success}${failed.length ? `\nFailed: ${failed.length}` : ""}`,
    )
    .setFooter({
      text: failed.length
        ? failed.join("\n")
        : "All commands reloaded without errors.",
    });
}

module.exports = {
  name: "reload",
  description: "Hot reloads all commands.",
  usage: "reload",
  category: "developer",
  aliases: ["hotfix", "reloadall"],
  owner_only: true,
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Hot reloads all commands (owner only)"),

  // message cmd
  async executeMessage(message) {
    const embed = await reloadCommands(message.client);
    await message.channel.send({ embeds: [embed] });
  },

  // slash cmd
  async executeInteraction(interaction) {
    const embed = await reloadCommands(interaction.client);
    await interaction.reply({
      embeds: [embed],
    });
  },
};
