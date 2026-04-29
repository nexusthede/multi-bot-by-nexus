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
  aliases: ["timeout", "tm"],

  async execute(message, args) {
    const target = message.mentions.members.first();
    const duration = args[1];

    const ms =
      duration?.endsWith("m")
        ? parseInt(duration) * 60 * 1000
        : duration?.endsWith("h")
        ? parseInt(duration) * 60 * 60 * 1000
        : duration?.endsWith("d")
        ? parseInt(duration) * 24 * 60 * 60 * 1000
        : 10 * 60 * 1000;

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

    await target.timeout(ms);

    return message.reply({
      embeds: [
        success(`> <@${target.id}> was muted by <@${message.author.id}>`)
      ]
    });
  }
};
