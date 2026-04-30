const { hide, fail } = require("../utils/embeds/embedchannels");
const { PermissionsBitField } = require("discord.js");
const { canUse } = require("../utils/perms");

module.exports = {
  name: "hide",
  aliases: ["h"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    // 🔐 permission check (NOW CENTRALIZED)
    if (!canUse(message.member, "hide"))
      return;

    // ⚠ bot permission check
    if (!message.guild.members.me.permissions.has(
      PermissionsBitField.Flags.ManageChannels
    )) {
      return message.channel.send({
        embeds: [fail("Bot missing Manage Channels permission")]
      });
    }

    const channel = message.channel;

    await channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      { ViewChannel: false }
    ).catch(() => {});

    return message.channel.send({
      embeds: [hide(channel.id)]
    });
  }
};
