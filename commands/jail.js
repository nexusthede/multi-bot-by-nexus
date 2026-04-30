const {
  fail,
  permission,
  jailed,
  log
} = require("../utils/embeds/embedjail");

const access = require("../config/access");
const { isAllowed } = require("../utils/guards");

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

    // 🛠 OWNER / ADMIN ONLY CHECK (your system)
    if (!isAllowed(message.member, access))
      return message.channel.send({
        embeds: [permission("Owner / Admin Access Required")]
      });

    if (target.id === message.author.id)
      return message.channel.send({
        embeds: [fail("You cannot jail yourself")]
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

    // 📜 LOGS
    if (logChannel) {
      logChannel.send({
        embeds: [
          log(`<@${target.id}>`, `<@${message.author.id}>`)
        ]
      }).catch(err => console.log("LOG ERROR:", err));
    }

    // 💬 RESPONSE (clean embed system)
    return message.channel.send({
      embeds: [
        jailed(`<@${target.id}> has been jailed`)
      ]
    });
  }
};
