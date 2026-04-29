const access = require("../config/access");
const { hide, fail } = require("../utils/embeds/embedchannels");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "hide",
  aliases: ["h"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const isOwner = access.owner?.some(id => message.member.roles.cache.has(id));
    const isAdmin = access.admin?.some(id => message.member.roles.cache.has(id));

    if (!isOwner && !isAdmin) return;

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
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
