const fs = require("fs");
const path = require("path");

function loadCommands(client, baseDir) {
  const load = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        load(fullPath);
      } else if (file.name.endsWith(".js")) {
        const command = require(fullPath);
        client.commands.set(command.name, command);
        if (command.aliases) {
          for (const alias of command.aliases) {
            client.commands.set(alias, command);
          }
        }
      }
    }
  };
  load(path.join(__dirname, "..", baseDir));
}

function loadEvents(client, baseDir) {
  const dirPath = path.join(__dirname, "..", baseDir);
  const eventFiles = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const event = require(path.join(dirPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

module.exports = {
  loadCommands,
  loadEvents,
};
