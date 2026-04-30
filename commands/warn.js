const access = require("../config/access");
const Warn = require("../models/warnmodel");

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
  name: "warn",
  aliases: ["w", "warning"],

  async execute(message, args) {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(" ") || "No reason provided";

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🛠 GLOBAL STAFF CHECK
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

    // 📦 DATABASE
    let data = await Warn.findOne({
      guildId: message.guild.id,
      userId: target.id
    });

    if (!data) {
      data = new Warn({
        guildId: message.guild.id,
        userId: target.id,
        warns: []
      });
    }

    data.warns.push({
      modId: message.author.id,
      reason,
      time: Date.now()
    });

    await data.save();

    return message.channel.send({
      embeds: [
        success(
          `<@${target.id}> was warned by <@${message.author.id}>\n• Reason: ${reason}\n• Total warns: ${data.warns.length}`
        )
      ]
    });
  }
};
