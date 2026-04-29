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
  name: "mute",

  async execute(message, args) {
    const target = message.mentions.members.first();

    if (!target)
      return message.reply({
        embeds: [fail("No user mentioned")]
      });

    if (!hasAccess(message.member, access.mod))
      return message.reply({
        embeds: [permission("Moderate Members")]
      });

    if (isProtected(target))
      return message.reply({
        embeds: [fail("This user is protected")]
      });

    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.reply({
        embeds: [hierarchyUser(target)]
      });

    if (check === "BOT")
      return message.reply({
        embeds: [hierarchyBot(target)]
      });

    // default mute time (10 minutes)
    const duration = 10 * 60 * 1000;

    await target.timeout(duration);

    return message.reply({
      embeds: [
        success(`${target.user.tag} was muted by ${message.author.tag}`)
      ]
    });
  }
};
