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
  name: "kick",
  aliases: ["k"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 CENTRAL PERMISSION CHECK
    if (!canUse(message.member, "kick"))
      return message.channel.send({
        embeds: [permission("Staff Access Required")]
      });

    // ⚠ BOT PERMISSION CHECK (IMPORTANT FIX)
    if (!message.guild.members.me.permissions.has("KickMembers"))
      return message.channel.send({
        embeds: [fail("Bot missing Kick Members permission")]
      });

    // ⚠ SELF KICK PREVENTION
    if (target.id === message.author.id)
      return message.channel.send({
        embeds: [fail("You cannot kick yourself")]
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
      await target.kick();
    } catch (err) {
      return message.channel.send({
        embeds: [fail("Failed to kick user")]
      });
    }

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was kicked by <@${message.author.id}>`)
      ]
    });
  }
};
