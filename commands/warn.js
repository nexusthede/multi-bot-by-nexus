const { EmbedBuilder } = require("discord.js");
const Warn = require("../models/Warn");

module.exports = {
  name: "warn",
  async execute(message, args) {
    const t = message.mentions.members.first();
    if (!t) return message.reply("mention user");

    const reason = args.slice(1).join(" ") || "No reason";

    let data = await Warn.findOne({ guildId: message.guild.id, userId: t.id });

    if (!data) data = new Warn({ guildId: message.guild.id, userId: t.id, warns: [] });

    data.warns.push({ modId: message.author.id, reason, time: Date.now() });
    await data.save();

    message.reply({ embeds:[new EmbedBuilder().setTitle("WARNED").setColor(0xF1C40F).setDescription(reason)] });
  }
};