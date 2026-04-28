const { actionEmbed, failEmbed, permissionEmbed } = require("../utils/embeds");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ban",
  aliases: ["b", "hammer"],

  async execute(message, args) {
    const target = message.mentions.members.first();
    if (!target)
      return message.reply({ embeds: [failEmbed("Mention a user")] });

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply({ embeds: [permissionEmbed("Ban Members")] });

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply({ embeds: [permissionEmbed("Bot lacks Ban Members")] });

    await target.ban();

    return message.reply({
      embeds: [actionEmbed("ban", target, message.author)]
    });
  }
};
