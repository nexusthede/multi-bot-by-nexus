const Warn = require("../models/warnmodel");

const {
  fail,
  permission,
  hierarchyUser,
  hierarchyBot,
  success
} = require("../utils/embeds/embedmod");

const {
  isProtected,
  checkHierarchy
} = require("../utils/guards");

const { canUse } = require("../utils/perms");

module.exports = {
  name: "warn",
  aliases: ["w", "warning"],

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();
    const reason = args.slice(1).join(" ") || "No reason provided";

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 CENTRAL PERMISSION CHECK
    if (!canUse(message.member, "warn"))
      return message.channel.send({
        embeds: [permission("Staff Access Required")]
      });

    // ⚠ BOT HIERARCHY CHECK (SAFETY)
    if (target.roles.highest.position >= message.guild.members.me.roles.highest.position)
      return message.channel.send({
        embeds: [fail("My role is too low to warn this user")]
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
