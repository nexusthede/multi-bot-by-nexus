const access = require("../config/access");

const {
  fail,
  permission,
  roleRemoved
} = require("../utils/embeds/embedrole");

const {
  hasAccess,
  isProtected,
  checkHierarchy
} = require("../utils/guards");

module.exports = {
  name: "removerole",
  aliases: ["rr"],

  async execute(message) {
    const target = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!target || !role)
      return message.channel.send({
        embeds: [fail("Usage: .removerole @user @role")]
      });

    if (
      !hasAccess(message.member, access.owner) &&
      !hasAccess(message.member, access.admin) &&
      !hasAccess(message.member, access.srmod)
    )
      return message.channel.send({
        embeds: [permission("Owner / Admin / Sr Mod Only")]
      });

    if (isProtected(target))
      return message.channel.send({
        embeds: [fail("This user is protected")]
      });

    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.channel.send({
        embeds: [fail("User has higher role hierarchy")]
      });

    if (check === "BOT")
      return message.channel.send({
        embeds: [fail("Bot role is too low")]
      });

    await target.roles.remove(role);

    return message.channel.send({
      embeds: [roleRemoved(target, role)]
    });
  }
};
