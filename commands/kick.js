const { actionEmbed, failEmbed, permissionEmbed } = require("../utils/embeds");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kick",
  aliases: ["k"],

  async execute(message, args) {
    const target = message.mentions.members.first();
    if (!target)
      return message.reply({ embeds: [failEmbed("Mention a user")] });

    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply({ embeds: [permissionEmbed("Kick Members")] });

    await target.kick();

    return message.reply({
      embeds: [actionEmbed("kick", target, message.author)]
    });
  }
};
