module.exports = {
  name: "clear",
  description: "Deletes up to 99 messages.",
  usage: "clear <num>",
  category: "moderation",
  cooldown: 3,
  aliases: ["prune"],
  async execute(message, args) {
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 99) {
      return message.reply("Enter a number between 1 and 99.");
    }
    await message.channel.bulkDelete(amount + 1, true);
    message.channel
      .send(`Cleared ${amount} messages.`)
      .then((m) => setTimeout(() => m.delete(), 5000));
  },
};
