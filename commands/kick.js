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
      return message.reply({ embeds: [fail("No user mentioned")] });

    if (!hasAccess(message.member, access.mod))
      return message.reply({ embeds: [permission("Kick Members")] });

    if (isProtected(target))
      return message.reply({ embeds: [fail("This user is protected")] });

    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.reply({ embeds: [hierarchyUser(target)] });

    if (check === "BOT")
      return message.reply({ embeds: [hierarchyBot(target)] });

    await target.kick();

    return message.reply({
      embeds: [
        success(`> <@${target.id}> was kicked by <@${message.author.id}>`)
      ]
    });
  }
};
