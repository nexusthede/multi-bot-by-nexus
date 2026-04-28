const Warn = require("../models/Warn");
const { warnEmbed, failEmbed } = require("../utils/embeds");

module.exports = {
  name: "warn",

  async execute(message, args) {
    const t = message.mentions.members.first();
    if (!t) return message.reply({ embeds: [failEmbed("mention user")] });

    const reason = args.slice(1).join(" ") || "No reason";

    let data = await Warn.findOne({
      guildId: message.guild.id,
      userId: t.id
    });

    if (!data) {
      data = new Warn({
        guildId: message.guild.id,
        userId: t.id,
        warns: []
      });
    }

    data.warns.push({
      modId: message.author.id,
      reason,
      time: Date.now()
    });

    await data.save();

    return message.reply({
      embeds: [
        warnEmbed(
          t,
          message.author,
          reason,
          data.warns.length
        )
      ]
    });
  }
};
