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

  async execute(message, args) {
    const target = message.mentions.members.first();

    // no user
    if (!target)
      return message.reply({
        embeds: [fail("No user mentioned")]
      });

    // permission check
    if (!hasAccess(message.member, access.mod))
      return message.reply({
        embeds: [permission("Kick Members")]
      });

    // protected system
    if (isProtected(target))
      return message.reply({
        embeds: [fail("This user is protected")]
      });

    // hierarchy check
    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.reply({
        embeds: [hierarchyUser(target)]
      });

    if (check === "BOT")
      return message.reply({
        embeds: [hierarchyBot(target)]
      });

    // action
    await target.kick();

    // success
    return message.reply({
      embeds: [
        success(`${target.user.tag} was kicked by ${message.author.tag}`)
      ]
    });
  }
};
