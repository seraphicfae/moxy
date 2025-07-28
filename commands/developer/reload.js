const fs = require("node:fs");
const path = require("node:path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "reload",
  description: "Hot reloads all commands.",
  owner_only: true,
  cooldown: 5,
  category: "developer",
  aliases: ["hotfix", "reloadall"],
  async execute(message) {
    const embed = new EmbedBuilder().setColor("#FFC0CB");
    const commandsPath = path.join(process.cwd(), "commands");

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

    const files = walkSync(commandsPath);
    let success = 0;
    const failed = [];

    for (const file of files) {
      try {
        const reqPath = require.resolve(file);
        delete require.cache[reqPath];
        const newCommand = require(reqPath);

        if (!newCommand.name || typeof newCommand.execute !== "function") {
          throw new Error("Invalid command format");
        }

        message.client.commands.set(newCommand.name, newCommand);
        success++;
      } catch (err) {
        console.error(`Failed to reload ${file}:`, err);
        failed.push(`${path.relative(commandsPath, file)} → ${err.message}`);
      }
    }

    embed
      .setTitle(`Reloaded commands`)
      .setDescription(
        `Success: ${success}${failed.length ? `\nFailed: ${failed.length}` : ""}`,
      )
      .setFooter({
        text: failed.length
          ? failed.join("\n")
          : "All commands reloaded without errors.",
      });

    await message.channel.send({ embeds: [embed] });
  },
};
