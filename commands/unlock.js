const access = require("../config/access");
const { unlock } = require("../utils/embeds/embedchannels");

module.exports = {
  name: "unlock",
  aliases: ["ul"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const isOwner = access.owner?.some(id => message.member.roles.cache.has(id));
    const isAdmin = access.admin?.some(id => message.member.roles.cache.has(id));

    if (!isOwner && !isAdmin) return;

    const channel = message.channel;

    await channel.permissionOverwrites.edit(
      message.guild.roles.everyone.id,
      { SendMessages: true }
    ).catch(() => {});

    return message.channel.send({
      embeds: [unlock(channel.id)]
    });
  }
};
