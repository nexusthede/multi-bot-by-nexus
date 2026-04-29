const {
  fail,
  permission,
  log
} = require("../utils/embeds/embedjail");

const access = require("../config/access");

module.exports = {
  name: "unjail",
  aliases: ["uj"],

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

    // ❌ not jailed
    if (!target.roles.cache.has(jailRole.id))
      return message.reply({ embeds: [fail("User is not jailed")] });

    // 🔓 unjail
    await target.roles.remove(jailRole).catch(() => {
      return message.reply({ embeds: [fail("Failed to unjail user")] });
    });

    // 📜 logs (UNCHANGED LOG SYSTEM)
    if (logChannel) {
      const embed = log(target.user.tag, message.author.tag);

      if (embed) {
        embed.setDescription(
          `**JAIL EVENT**\n• User\n> ${target.user.tag}\n• Action\n> unjailed\n• By\n> ${message.author.tag}`
        );

        logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // 💬 command channel embed (NO COLOR)
    return message.reply({
      embeds: [
        {
          description: `${target.user.tag} has been unjailed.`
        }
      ]
    });
  }
};
