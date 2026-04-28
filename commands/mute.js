const { actionEmbed, failEmbed, permissionEmbed } = require("../utils/embeds");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "mute",
  aliases: ["timeout", "m"],

  async execute(message, args) {
    const target = message.mentions.members.first();
    const time = args[1];

    if (!target || !time)
      return message.reply({ embeds: [failEmbed("Usage: .mute @user time")] });

    const ms = time.endsWith("m")
      ? parseInt(time) * 60000
      : parseInt(time) * 3600000;

    await target.timeout(ms);

    return message.reply({
      embeds: [actionEmbed("mute", target, message.author)]
    });
  }
};
