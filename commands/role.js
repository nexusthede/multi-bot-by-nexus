const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const colors = require("../utils/embeds/colors");

module.exports = {
  name: "roles",

  async execute(message) {
    // 📦 SNAPSHOT (only updates when command is run again)
    const roles = message.guild.roles.cache
      .filter(r => r.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .map(r => r);

    const perPage = 10;
    const pages = Math.ceil(roles.length / perPage);

    let page = 1;

    const generateEmbed = (page) => {
      const start = (page - 1) * perPage;
      const end = start + perPage;

      const pageRoles = roles.slice(start, end);

      const description =
        pageRoles
          .map((r, i) => `*${start + i + 1}.* <@&${r.id}> — ${r.id}`)
          .join("\n") || "No roles found";

      return new EmbedBuilder()
        .setColor(colors.main)
        .setTitle("Server Roles")
        .setAuthor({
          name: message.guild.name,
          iconURL: message.guild.iconURL({ dynamic: true })
        })
        .setDescription(description)
        .setFooter({
          text: `Page ${page}/${pages} • ${roles.length} roles (excluding @everyone)`
        });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("first")
        .setEmoji("⏮️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("◀️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("▶️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("last")
        .setEmoji("⏭️")
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({
      embeds: [generateEmbed(page)],
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({
      time: 120000,
      filter: (i) => i.user.id === message.author.id
    });

    collector.on("collect", async (i) => {
      if (i.customId === "first") page = 1;
      if (i.customId === "prev" && page > 1) page--;
      if (i.customId === "next" && page < pages) page++;
      if (i.customId === "last") page = pages;

      await i.update({
        embeds: [generateEmbed(page)],
        components: [row]
      });
    });

    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("first")
          .setEmoji("⏮️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId("prev")
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId("last")
          .setEmoji("⏭️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      msg.edit({ components: [disabledRow] }).catch(() => {});
    });
  }
};
