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
  name: "ban",
  aliases: ["b", "banish"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 PERMISSION CHECK
    if (!canUse(message.member, "ban"))
      return message.channel.send({
        embeds: [permission("Admin / SrMod only")]
      });

    // 🛡 PROTECTION CHECK
    if (isProtected(target))
      return message.channel.send({
        embeds: [fail("This user is protected")]
      });

    // ⚠ BOT PERMISSION CHECK (IMPORTANT FIX)
    if (!message.guild.members.me.permissions.has("BanMembers"))
      return message.channel.send({
        embeds: [fail("Bot missing Ban Members permission")]
      });

    // ⚠ SELF BAN PREVENTION
    if (target.id === message.author.id)
      return message.channel.send({
        embeds: [fail("You cannot ban yourself")]
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

    // 🔥 ACTION (SAFE WRAPPED)
    try {
      await target.ban();
    } catch (err) {
      return message.channel.send({
        embeds: [fail("Failed to ban user")]
      });
    }

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was banned by <@${message.author.id}>`)
      ]
    });
  }
};
