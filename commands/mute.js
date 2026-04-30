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

// ⏱ duration parser
function parseDuration(input) {
  if (!input) return 10 * 60 * 1000; // default 10m

  const match = input.toLowerCase().match(/^(\d+)(m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

module.exports = {
  name: "mute",
  aliases: ["timeout", "tm"],

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();
    const durationInput = args[1];

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 permission check
    if (!canUse(message.member, "mute"))
      return message.channel.send({
        embeds: [permission("Staff Access Required")]
      });

    const ms = parseDuration(durationInput);

    if (ms === null)
      return message.channel.send({
        embeds: [fail("Invalid duration. Use 10m, 2h, 1d")]
      });

    // ⚠ Discord max timeout = 28 days
    const max = 28 * 24 * 60 * 60 * 1000;
    if (ms > max)
      return message.channel.send({
        embeds: [fail("Maximum timeout is 28 days")]
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

    await target.timeout(ms);

    return message.channel.send({
      embeds: [
        success(`<@${target.id}> was muted for ${durationInput || "10m"} by <@${message.author.id}>`)
      ]
    });
  }
};
