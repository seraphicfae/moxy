module.exports = {
  name: "test",
  description: "Debugging and testing tool.",
  usage: "test [function]",
  category: "developer",
  owner_only: true,
  cooldown: 3,
  aliases: ["testing"],
  async execute(message) {
    message.channel.send("Executed");
  },
};
