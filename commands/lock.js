const access = require("../config/access");
const { lock, fail, permission } = require("../utils/embeds/embedchannels");

module.exports = {
  name: "lock",
  aliases: ["l"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const isOwner = access.owner?.some(id => message.member.roles.cache.has(id));
    const isAdmin = access.admin?.some(id => message.member.roles.cache.has(id));

    if (!isOwner && !isAdmin)
      return message.reply({ embeds: [permission()] });

    const channel = message.channel;

    const everyone = message.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, {
      SendMessages: false
    }).catch(() => {
      return message.reply({ embeds: [fail("Failed to lock channel")] });
    });

    return message.reply({
      embeds: [lock(channel.name)]
    });
  }
};
