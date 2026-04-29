const access = require("../config/access");
const { unhide, fail, permission } = require("../utils/embeds/embedchannels");

module.exports = {
  name: "unhide",
  aliases: ["uh"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const isOwner = access.owner?.some(id => message.member.roles.cache.has(id));
    const isAdmin = access.admin?.some(id => message.member.roles.cache.has(id));

    if (!isOwner && !isAdmin)
      return message.reply({ embeds: [permission()] });

    const channel = message.channel;
    const everyone = message.guild.roles.everyone;

    await channel.permissionOverwrites.edit(everyone, {
      ViewChannel: true
    }).catch(() => {
      return message.reply({ embeds: [fail("Failed to unhide channel")] });
    });

    return message.reply({
      embeds: [unhide(channel.name)]
    });
  }
};
