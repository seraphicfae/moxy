const { PREFIX } = require("../../utils/config.json");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "help",
  description: "Shows commands and usage.",
  usage: "help [command|category]",
  category: "utility",
  aliases: ["commands"],

  async execute(message, args) {
    const all = [...message.client.commands.values()];
    const unique = Array.from(new Map(all.map((c) => [c.name, c])).values());

    if (args.length && message.client.commands.has(args[0].toLowerCase())) {
      const name = args[0].toLowerCase();
      const cmd =
        message.client.commands.get(name) ||
        unique.find((c) => c.aliases?.includes(name));
      if (!cmd) return message.reply(`No command found named \`${name}\`.`);

      const aliases = cmd.aliases?.map((a) => `\`${a}\``).join(", ") || "None";
      const required = cmd.roles
        ? cmd.roles.map((id) => `<@&${id}>`).join(" • ")
        : "None";

      const embed = new EmbedBuilder()
        .setTitle(`Help: ${cmd.name}`)
        .addFields(
          {
            name: "Description",
            value: cmd.description || "No description",
            inline: false,
          },
          {
            name: "Usage",
            value: `\`${PREFIX}${cmd.usage || cmd.name}\``,
            inline: false,
          },
          { name: "Aliases", value: aliases, inline: false },
          { name: "Cooldown", value: `${cmd.cooldown ?? 1}s`, inline: false },
          {
            name: "Category",
            value: cmd.category || "Uncategorized",
            inline: false,
          },
        )
        .setColor("#FFC0CB")
        .setFooter({ text: `Use ${PREFIX}help [command] for more info` });

      return message.channel.send({ embeds: [embed] });
    }

    const grouped = unique.reduce((o, cmd) => {
      const cat = cmd.category || "Misc";
      o[cat] ||= [];
      o[cat].push(`\`${PREFIX}${cmd.name}\``);
      return o;
    }, {});
    const cats = Object.keys(grouped);
    const embeds = [];

    embeds.push(
      new EmbedBuilder()
        .setTitle("Table of Contents")
        .setDescription(cats.map((c, i) => `${i + 1}. **${c}**`).join("\n"))
        .setColor("#FFC0CB")
        .setFooter({
          text: `Page 1/${cats.length + 1} • Use ${PREFIX}help [command] or [category]`,
        }),
    );

    cats.forEach((cat, idx) => {
      embeds.push(
        new EmbedBuilder()
          .setTitle(`${cat} Commands`)
          .setDescription(grouped[cat].join(" "))
          .setColor("#FFC0CB")
          .setFooter({
            text: `Page ${idx + 2}/${cats.length + 1} • Use ${PREFIX}help [command] or [category]`,
          }),
      );
    });

    let page = 0;
    if (args.length) {
      const jumpIdx = cats.findIndex(
        (c) => c.toLowerCase() === args[0].toLowerCase(),
      );
      if (jumpIdx !== -1) page = jumpIdx + 1;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("first")
        .setLabel("⏮ First")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("◀ Prev")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next ▶")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === embeds.length - 1),
      new ButtonBuilder()
        .setCustomId("last")
        .setLabel("Last ⏭")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === embeds.length - 1),
    );

    const sent = await message.channel.send({
      embeds: [embeds[page]],
      components: [row],
    });

    const collector = sent.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 120_000,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      const id = i.customId;
      if (id === "first") page = 0;
      else if (id === "prev" && page > 0) page--;
      else if (id === "next" && page < embeds.length - 1) page++;
      else if (id === "last") page = embeds.length - 1;

      row.components.forEach((btn) => {
        const cid = btn.data.custom_id;
        btn.setDisabled(
          cid === "first" || cid === "prev"
            ? page === 0
            : cid === "next" || cid === "last"
              ? page === embeds.length - 1
              : false,
        );
      });

      await sent.edit({ embeds: [embeds[page]], components: [row] });
    });

    collector.on("end", () => {
      row.components.forEach((btn) => btn.setDisabled(true));
      sent.edit({ components: [row] });
    });
  },
};
