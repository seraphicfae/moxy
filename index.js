const { Client, Collection, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { loadCommands, loadEvents } = require("./utils/loaders");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

loadCommands(client, "commands");
loadEvents(client, "events");

client.login(process.env.TOKEN);
