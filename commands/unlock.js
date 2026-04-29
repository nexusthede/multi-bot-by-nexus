const access = require("../config/access");
const { unlock, fail } = require("../utils/embeds/embedchannels");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "unlock",
  aliases: ["ul"],

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
      { SendMessages: true }
    ).catch(() => {});

    return message.channel.send({
      embeds: [unlock(channel.id)]
    });
  }
};
