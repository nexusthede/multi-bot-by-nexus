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

// ⏱ ADVANCED duration parser (supports 6d 3h 20m)
function parseDuration(input) {
  if (!input || typeof input !== "string") return 10 * 60 * 1000;

  const regex = /(\d+)\s*(d|h|m)/g;
  let match;
  let ms = 0;

  const map = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000
  };

  let found = false;

  while ((match = regex.exec(input.toLowerCase())) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    ms += value * map[unit];
    found = true;
  }

  return found ? ms : null;
}

module.exports = {
  name: "mute",
  aliases: ["timeout", "tm"],

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();
    const durationInput = args.slice(1).join(" "); // supports multi-part input

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 PERMISSION CHECK
    if (!canUse(message.member, "mute"))
      return message.channel.send({
        embeds: [permission("Staff Access Required")]
      });

    // ⚠ BOT PERMISSION CHECK
    if (!message.guild.members.me.permissions.has("ModerateMembers"))
      return message.channel.send({
        embeds: [fail("Bot missing Timeout Members permission")]
      });

    // ⚠ SELF MUTE PREVENTION
    if (target.id === message.author.id)
      return message.channel.send({
        embeds: [fail("You cannot mute yourself")]
      });

    // 🛡 PROTECTION CHECK
    if (isProtected(target))
      return message.channel.send({
        embeds: [fail("This user is protected")]
      });

    // ⚖ HIERARCHY CHECK
    const check = checkHierarchy(message, target);

    if (check === "USER")
      return message.channel.send({
        embeds: [hierarchyUser(target)]
      });

    if (check === "BOT")
      return message.channel.send({
        embeds: [hierarchyBot(target)]
      });

    // ⏱ PARSE DURATION
    const ms = parseDuration(durationInput);

    if (ms === null)
      return message.channel.send({
        embeds: [fail("Invalid duration. Use 10m, 2h, 6d 3h 20m")]
      });

    // ⚠ MAX LIMIT (Discord rule)
    const max = 28 * 24 * 60 * 60 * 1000;

    if (ms > max)
      return message.channel.send({
        embeds: [fail("Maximum timeout is 28 days")]
      });

    // 🔥 ACTION
    try {
      await target.timeout(ms);
    } catch (err) {
      return message.channel.send({
        embeds: [fail("Failed to mute user")]
      });
    }

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was muted for \`${durationInput}\` by <@${message.author.id}>`)
      ]
    });
  }
};
