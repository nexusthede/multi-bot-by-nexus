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
  name: "ban",
  aliases: ["b", "banish"],

  async execute(message) {
    const target = message.mentions.members.first();

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🛠 CLEAN STAFF CHECK (FIXED)
    const staff =
      access.mod
        .concat(
          access.srmod,
          access.admin,
          access.trialmod,
          access.helper,
          access.support
        );

    if (!hasAccess(message.member, staff))
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

    await target.ban();

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was banned by <@${message.author.id}>`)
      ]
    });
  }
};
