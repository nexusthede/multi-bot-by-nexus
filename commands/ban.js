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

const { canUse } = require("../utils/moderation");

module.exports = {
  name: "ban",
  aliases: ["b", "banish"],

  async execute(message) {
    const target = message.mentions.members.first();

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 CLEAN PERMISSION CHECK
    if (!canUse(message.member, "ban"))
      return message.channel.send({
        embeds: [permission("Admin / SrMod only")]
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

    await target.ban();

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was banned by <@${message.author.id}>`)
      ]
    });
  }
};
