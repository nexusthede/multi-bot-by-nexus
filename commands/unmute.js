const { actionEmbed, failEmbed, permissionEmbed } = require("../utils/embeds");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "unmute",
  aliases: ["untimeout", "um"],

  async execute(message, args) {
    const target = message.mentions.members.first();

    // ❌ no user
    if (!target) {
      return message.reply({
        embeds: [failEmbed("Mention a user")]
      });
    }

    // ❌ bot permission
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply({
        embeds: [permissionEmbed("Bot lacks Moderate Members permission")]
      });
    }

    // ❌ user permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply({
        embeds: [permissionEmbed("Moderate Members")]
      });
    }

    // ❌ self action
    if (target.id === message.author.id) {
      return message.reply({
        embeds: [failEmbed("You cannot use this command on yourself")]
      });
    }

    // ❌ hierarchy check
    if (target.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({
        embeds: [failEmbed("You cannot moderate someone with equal or higher role")]
      });
    }

    try {
      await target.timeout(null); // removes timeout

      return message.reply({
        embeds: [actionEmbed("unmute", target, message.author)]
      });

    } catch (err) {
      console.error(err);
      return message.reply({
        embeds: [failEmbed("Failed to unmute user")]
      });
    }
  }
};
