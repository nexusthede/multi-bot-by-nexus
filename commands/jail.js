const {
  fail,
  permission,
  jailed,
  log
} = require("../utils/embeds/embedjail");

const access = require("../config/access");

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
      return message.reply({ embeds: [fail("No user mentioned")] });

    // ⚖ admin only
    if (!message.member.roles.cache.some(r => access.admin.includes(r.id)))
      return message.reply({ embeds: [permission()] });

    // ❌ self
    if (target.id === message.author.id)
      return message.reply({ embeds: [fail("You cannot jail yourself")] });

    // ❌ already jailed
    if (target.roles.cache.has(jailRole.id))
      return message.reply({ embeds: [fail("User is already jailed")] });

    // 🔒 jail role
    await target.roles.add(jailRole).catch(() => {
      return message.reply({ embeds: [fail("Failed to jail user")] });
    });

    // 📜 logs (UNCHANGED)
    if (logChannel) {
      logChannel.send({
        embeds: [log(target.user.tag, message.author.tag)]
      }).catch(() => {});
    }

    // ❌ jail channel removed completely

    // 💬 embed in command channel
    return message.reply({
      embeds: [
        {
          description: `${target.user.tag} has been jailed.`
        }
      ]
    });
  }
};
