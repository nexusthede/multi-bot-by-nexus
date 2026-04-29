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

    // ❌ no user
    if (!target)
      return message.reply({
        embeds: [fail("> No user mentioned")]
      });

    // ⚖ staff only
    if (!hasAccess(message.member, access.mod))
      return message.reply({
        embeds: [permission("> Staff only")]
      });

    // 🛡 protected
    if (isProtected(target))
      return message.reply({
        embeds: [fail("> This user is protected")]
      });

    // ⚖ hierarchy
    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.reply({
        embeds: [hierarchyUser(target)]
      });

    if (check === "BOT")
      return message.reply({
        embeds: [hierarchyBot(target)]
      });

    // 📦 database
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

    // ✅ success embed (FIXED MENTIONS + STYLE)
    return message.reply({
      embeds: [
        success(
          `> <@${target.id}> was warned by <@${message.author.id}>\n• Reason:\n> ${reason}\n• Total warns:\n> ${data.warns.length}`
        )
      ]
    });
  }
};
