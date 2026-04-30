const {
  fail,
  permission,
  roleRemoved
} = require("../utils/embeds/embedrole");

const {
  isProtected,
  checkHierarchy
} = require("../utils/guards");

const { canUse } = require("../utils/perms");

module.exports = {
  name: "removerole",
  aliases: ["rr"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();
    const role = message.mentions.roles.first();

    if (!target || !role)
      return message.channel.send({
        embeds: [fail("Usage: .removerole @user @role")]
      });

    // 🔐 CENTRAL PERMISSION CHECK
    if (!canUse(message.member, "removerole"))
      return message.channel.send({
        embeds: [permission("Owner / Admin / Sr Mod Only")]
      });

    // ⚠ BOT PERMISSION CHECK
    if (!message.guild.members.me.permissions.has("ManageRoles"))
      return message.channel.send({
        embeds: [fail("Bot missing Manage Roles permission")]
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

    try {
      await target.roles.remove(role);
    } catch (err) {
      return message.channel.send({
        embeds: [fail("Failed to remove role")]
      });
    }

    return message.channel.send({
      embeds: [roleRemoved(target, role)]
    });
  }
};
