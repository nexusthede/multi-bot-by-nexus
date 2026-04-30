const {
  fail,
  permission,
  jailed,
  log
} = require("../utils/embeds/embedjail");

const { canUse } = require("../utils/perms");

module.exports = {
  name: "jail",
  aliases: ["j"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();

    const jailRole = message.guild.roles.cache.get("1492118672267939861");
    const logChannel = message.guild.channels.cache.get("1497815554956853359");

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 PERMISSION CHECK
    if (!canUse(message.member, "jail"))
      return message.channel.send({
        embeds: [permission("Admin / SrMod Access Required")]
      });

    // ⚠ SELF JAIL PREVENTION
    if (target.id === message.author.id)
      return message.channel.send({
        embeds: [fail("You cannot jail yourself")]
      });

    // ⚠ BOT HIERARCHY CHECK (IMPORTANT FIX)
    if (target.roles.highest.position >= message.guild.members.me.roles.highest.position)
      return message.channel.send({
        embeds: [fail("My role is too low to jail this user")]
      });

    if (!jailRole)
      return message.channel.send({
        embeds: [fail("Jail role not found")]
      });

    if (target.roles.cache.has(jailRole.id))
      return message.channel.send({
        embeds: [fail("User is already jailed")]
      });

    try {
      await target.roles.add(jailRole);
    } catch (err) {
      console.log("JAIL ERROR:", err);
      return message.channel.send({
        embeds: [fail("Failed to jail user")]
      });
    }

    // 📜 LOGS (UNCHANGED)
    if (logChannel) {
      logChannel.send({
        embeds: [
          log(`<@${target.id}>`, `<@${message.author.id}>`)
        ]
      }).catch(err => console.log("LOG ERROR:", err));
    }

    // 💬 RESPONSE
    return message.channel.send({
      embeds: [
        jailed(`<@${target.id}> has been jailed`)
      ]
    });
  }
};
