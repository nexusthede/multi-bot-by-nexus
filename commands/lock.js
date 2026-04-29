const access = require("../config/access");
const { lock, fail, permission } = require("../utils/embeds/embedchannels");

module.exports = {
  name: "lock",
  aliases: ["l"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const isOwner = access.owner?.some(id => message.member.roles.cache.has(id));
    const isAdmin = access.admin?.some(id => message.member.roles.cache.has(id));

    if (!isOwner && !isAdmin) return;

    const channel = message.channel;

    await channel.permissionOverwrites.edit(
      message.guild.roles.everyone.id,
      { SendMessages: false }
    ).catch(() => {});

    return message.channel.send({
      embeds: [lock(channel.id)]
    });
  }
};
