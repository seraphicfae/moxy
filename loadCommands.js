const { REST } = require("discord.js");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const path = require("path");
const { BOT_ID } = require("./utils/config.json");
require("dotenv").config({ quiet: true });

const commands = [];
const foldersPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(foldersPath)) {
  const files = fs
    .readdirSync(path.join(foldersPath, folder))
    .filter((f) => f.endsWith(".js"));
  for (const file of files) {
    const command = require(path.join(foldersPath, folder, file));
    if (command.data?.toJSON) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Registering ${commands.length} global slash commands...`);
    const globalData = await rest.put(Routes.applicationCommands(BOT_ID), {
      body: commands,
    });
    console.log(`Successfully reloaded ${globalData.length} global commands.`);
  } catch (error) {
    console.error(error);
  }
})();
