const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`${client.user.tag} is online!`);

    const statuses = [
      { name: "with your heart", type: ActivityType.Playing },
      { name: "you", type: ActivityType.Watching },
      { name: "your secrets", type: ActivityType.Listening },
    ];

    let index = 0;

    client.user.setActivity(statuses[index].name, {
      type: statuses[index].type,
    });

    setInterval(() => {
      index = (index + 1) % statuses.length;
      const current = statuses[index];
      client.user.setActivity(current.name, { type: current.type });
    }, 100_000);
  },
};
