const { hide, fail, permission } = require("../utils/embeds/embedchannels");
const { PermissionsBitField } = require("discord.js");
const { canUse } = require("../utils/perms");

module.exports = {
  name: "hide",
  aliases: ["h"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    // 🔐 permission check (CENTRALIZED)
    if (!canUse(message.member, "hide"))
      return message.channel.send({
        embeds: [permission("Admin only")]
      });

    // ⚠ bot permission check
    if (!message.guild.members.me.permissions.has(
      PermissionsBitField.Flags.ManageChannels
    )) {
      return message.channel.send({
        embeds: [fail("Bot missing Manage Channels permission")]
      });
    }

    const channel = message.channel;

    try {
      await channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { ViewChannel: false }
      );
    } catch {
      return message.channel.send({
        embeds: [fail("Failed to hide channel")]
      });
    }

    return message.channel.send({
      embeds: [hide(channel.id)]
    });
  }
};
