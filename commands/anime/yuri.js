const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "yuri",
  description: "Fetches you yuri images from Reddit.",
  usage: "yuri",
  category: "anime",
  aliases: ["girllove", "gl"],
  async execute(message) {
    await message.channel.sendTyping();

    const subreddits = ["wholesomeyuri", "yurigif", "ClassicYuri"];
    const url = `https://www.reddit.com/r/${subreddits.join("+")}/hot.json?limit=50&t=week`;

    let res;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": "DiscordBot (by /u/yourusername)" },
      });
    } catch (err) {
      console.error(err);
      return message.reply("Could not reach Reddit.");
    }

    if (!res.ok) {
      return message.reply("Reddit returned an error.");
    }

    const data = await res.json();
    const posts = data.data.children.map((c) => c.data);
    const images = posts.filter(
      (p) =>
        !p.over_18 &&
        (p.post_hint === "image" || /\.(jpg|jpeg|png|gif)$/i.test(p.url)),
    );

    if (!images.length) {
      return message.reply("No SFW yuri images found. Try again later!");
    }

    const post = images[Math.floor(Math.random() * images.length)];
    const embed = new EmbedBuilder()
      .setTitle(post.title || "Yuri")
      .setURL(`https://reddit.com${post.permalink}`)
      .setImage(post.url)
      .setColor("#FFC0CB")
      .setFooter({ text: `⬆️ ${post.ups} • Source: r/${post.subreddit}` });

    message.channel.send({ embeds: [embed] });
  },
};
