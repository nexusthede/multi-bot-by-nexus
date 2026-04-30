const { unlock, fail, permission } = require("../utils/embeds/embedchannels");
const { PermissionsBitField } = require("discord.js");
const { canUse } = require("../utils/perms");

module.exports = {
  name: "unlock",
  aliases: ["ul"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    // 🔐 CENTRAL PERMISSION CHECK
    if (!canUse(message.member, "lock"))
      return message.channel.send({
        embeds: [permission("Owner / Admin Access Required")]
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
        { SendMessages: true }
      );
    } catch (err) {
      return message.channel.send({
        embeds: [fail("Failed to unlock channel")]
      });
    }

    return message.channel.send({
      embeds: [unlock(channel.id)]
    });
  }
};
