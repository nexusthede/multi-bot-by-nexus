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
  name: "unmute",
  aliases: ["um", "untimeout"],

  async execute(message) {
    const target = message.mentions.members.first();

    if (!target)
      return message.reply({ embeds: [fail("> No user mentioned")] });

    if (!hasAccess(message.member, access.mod))
      return message.reply({ embeds: [permission("> Moderate Members")] });

    if (isProtected(target))
      return message.reply({ embeds: [fail("> This user is protected")] });

    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.reply({ embeds: [hierarchyUser(target)] });

    if (check === "BOT")
      return message.reply({ embeds: [hierarchyBot(target)] });

    await target.timeout(null);

    return message.reply({
      embeds: [
        success(`> <@${target.id}> was unmuted by <@${message.author.id}>`)
      ]
    });
  }
};
