const access = require("../config/access");

const {
  fail,
  permission,
  hierarchyUser,
  hierarchyBot,
  success
} = require("../utils/embeds/embedmod");

const {
  hasAccess,
  isProtected,
  checkHierarchy
} = require("../utils/guards");

module.exports = {
  name: "kick",
  aliases: ["k"],

  async execute(message) {
    const target = message.mentions.members.first();

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🛠 GLOBAL STAFF CHECK (same as ban.js style)
    if (
      !hasAccess(message.member, access.mod) &&
      !hasAccess(message.member, access.srmod) &&
      !hasAccess(message.member, access.admin) &&
      !hasAccess(message.member, access.trialmod) &&
      !hasAccess(message.member, access.helper) &&
      !hasAccess(message.member, access.support)
    )
      return message.channel.send({
        embeds: [permission("Staff Access Required")]
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

    await target.kick();

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was kicked by <@${message.author.id}>`)
      ]
    });
  }
};
