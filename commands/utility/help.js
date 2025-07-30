const { PREFIX } = require("../../utils/config.json");
const {
  SlashCommandBuilder,
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
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows commands and usage.")
    .addStringOption((opt) =>
      opt
        .setName("query")
        .setDescription("Command or category to get help for")
        .setRequired(false),
    ),

  // message cmd
  async executeMessage(message, args) {
    const allCommands = [...message.client.commands.values()];
    const { embeds, cats, unique } = createHelpEmbeds(allCommands);

    if (args.length) {
      const name = args[0].toLowerCase();

      let cmd =
        message.client.commands.get(name) ||
        unique.find((c) => c.aliases?.includes(name));

      if (cmd) {
        const aliases =
          cmd.aliases?.map((a) => `\`${a}\``).join(", ") || "None";
        const embed = new EmbedBuilder()
          .setTitle(`Help: ${cmd.name}`)
          .addFields(
            { name: "Description", value: cmd.description || "No description" },
            {
              name: "Usage",
              value: `\`${PREFIX}${cmd.usage || cmd.name}\``,
            },
            { name: "Aliases", value: aliases },
            { name: "Cooldown", value: `${cmd.cooldown ?? 1}s` },
            { name: "Category", value: cmd.category || "Uncategorized" },
          )
          .setColor("#FFC0CB")
          .setFooter({ text: `Use ${PREFIX}help [command] for more info` });

        return message.channel.send({ embeds: [embed] });
      }

      const catIdx = cats.findIndex((c) => c.toLowerCase() === name);
      if (catIdx !== -1) {
        return message.channel.send({ embeds: [embeds[catIdx + 1]] });
      }

      return message.reply(`No command or category found named \`${name}\`.`);
    }

    let page = 0;
    const row = createNavigationRow(page, embeds.length - 1);

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
      switch (i.customId) {
        case "first":
          page = 0;
          break;
        case "prev":
          if (page > 0) page--;
          break;
        case "next":
          if (page < embeds.length - 1) page++;
          break;
        case "last":
          page = embeds.length - 1;
          break;
      }

      const newRow = createNavigationRow(page, embeds.length - 1);
      await sent.edit({ embeds: [embeds[page]], components: [newRow] });
    });

    collector.on("end", () => {
      const disabledRow = createNavigationRow(page, embeds.length - 1);
      disabledRow.components.forEach((btn) => btn.setDisabled(true));
      sent.edit({ components: [disabledRow] });
    });
  },

  // slash cmd
  async executeInteraction(interaction) {
    const allCommands = [...interaction.client.commands.values()];
    const { embeds, cats, unique } = createHelpEmbeds(allCommands);

    const query = interaction.options.getString("query");
    if (query) {
      const name = query.toLowerCase();

      let cmd =
        interaction.client.commands.get(name) ||
        unique.find((c) => c.aliases?.includes(name));

      if (cmd) {
        const aliases =
          cmd.aliases?.map((a) => `\`${a}\``).join(", ") || "None";
        const embed = new EmbedBuilder()
          .setTitle(`Help: ${cmd.name}`)
          .addFields(
            { name: "Description", value: cmd.description || "No description" },
            {
              name: "Usage",
              value: `\`${PREFIX}${cmd.usage || cmd.name}\``,
            },
            { name: "Aliases", value: aliases },
            { name: "Cooldown", value: `${cmd.cooldown ?? 1}s` },
            { name: "Category", value: cmd.category || "Uncategorized" },
          )
          .setColor("#FFC0CB")
          .setFooter({ text: `Use ${PREFIX}help [command] for more info` });

        return interaction.reply({
          embeds: [embed],
        });
      }

      const catIdx = cats.findIndex((c) => c.toLowerCase() === name);
      if (catIdx !== -1) {
        return interaction.reply({
          embeds: [embeds[catIdx + 1]],
        });
      }

      return interaction.reply({
        content: `No command or category found named \`${name}\`.`,
      });
    }

    let page = 0;
    const row = createNavigationRow(page, embeds.length - 1);

    const sent = await interaction.reply({
      embeds: [embeds[page]],
      components: [row],
      fetchReply: true,
    });

    const collector = sent.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 120_000,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      switch (i.customId) {
        case "first":
          page = 0;
          break;
        case "prev":
          if (page > 0) page--;
          break;
        case "next":
          if (page < embeds.length - 1) page++;
          break;
        case "last":
          page = embeds.length - 1;
          break;
      }

      const newRow = createNavigationRow(page, embeds.length - 1);
      await sent.edit({ embeds: [embeds[page]], components: [newRow] });
    });

    collector.on("end", () => {
      const disabledRow = createNavigationRow(page, embeds.length - 1);
      disabledRow.components.forEach((btn) => btn.setDisabled(true));
      sent.edit({ components: [disabledRow] });
    });
  },
};

// buttons
const createHelpEmbeds = (commands) => {
  const unique = Array.from(new Map(commands.map((c) => [c.name, c])).values());

  const grouped = unique.reduce((acc, cmd) => {
    const cat = cmd.category || "Misc";
    acc[cat] ||= [];
    acc[cat].push(`\`${PREFIX}${cmd.name}\``);
    return acc;
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

  return { embeds, cats, unique };
};

const createNavigationRow = (page, maxPage) =>
  new ActionRowBuilder().addComponents(
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
      .setDisabled(page === maxPage),
    new ButtonBuilder()
      .setCustomId("last")
      .setLabel("Last ⏭")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === maxPage),
  );
