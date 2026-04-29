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

    // ❌ no user
    if (!target)
      return message.channel.send({ embeds: [fail("No user mentioned")] });

    // ⚖ guard (admins + owners only)
    if (!isAllowed(message.member, access))
      return message.channel.send({ embeds: [permission()] });

    // ❌ self jail
    if (target.id === message.author.id)
      return message.channel.send({ embeds: [fail("You cannot jail yourself")] });

    // ❌ already jailed
    if (target.roles.cache.has(jailRole.id))
      return message.channel.send({ embeds: [fail("User is already jailed")] });

    // 🔒 jail role
    await target.roles.add(jailRole).catch(() => {
      return message.channel.send({ embeds: [fail("Failed to jail user")] });
    });

    // 📜 logs (UNCHANGED SYSTEM)
    if (logChannel) {
      logChannel.send({
        embeds: [log(`<@${target.id}>`, `<@${message.author.id}>`)]
      }).catch(() => {});
    }

    // 💬 main response (NO REPLY)
    return message.channel.send({
      embeds: [
        jailed(target.id, message.author.id)
      ]
    });
  }
};
