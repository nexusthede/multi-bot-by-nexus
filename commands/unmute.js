const {
  fail,
  permission,
  hierarchyUser,
  hierarchyBot,
  success
} = require("../utils/embeds/embedmod");

const {
  isProtected,
  checkHierarchy
} = require("../utils/guards");

const { canUse } = require("../utils/perms");

module.exports = {
  name: "unmute",
  aliases: ["um", "untimeout"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 CENTRAL PERMISSION CHECK
    if (!canUse(message.member, "mute"))
      return message.channel.send({
        embeds: [permission("Staff Access Required")]
      });

    // ⚠ BOT PERMISSION CHECK
    if (!message.guild.members.me.permissions.has("ModerateMembers"))
      return message.channel.send({
        embeds: [fail("Bot missing Timeout Members permission")]
      });

    if (isProtected(target))
      return message.channel.send({
        embeds: [fail("This user is protected")]
      });

    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.channel.send({
        embeds: [hierarchyUser(target)]
      });

    if (check === "BOT")
      return message.channel.send({
        embeds: [hierarchyBot(target)]
      });

    try {
      await target.timeout(null);
    } catch (err) {
      return message.channel.send({
        embeds: [fail("Failed to unmute user")]
      });
    }

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was unmuted by <@${message.author.id}>`)
      ]
    });
  }
};
