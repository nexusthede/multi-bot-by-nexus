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
      return message.channel.send({ embeds: [fail("No user mentioned")] });

    // ⚖ access check (admins/owners only)
    if (!message.member.roles.cache.some(r => access.admin.includes(r.id)))
      return message.channel.send({ embeds: [permission()] });

    // ❌ not jailed
    if (!target.roles.cache.has(jailRole.id))
      return message.channel.send({ embeds: [fail("User is not jailed")] });

    // 🔓 remove jail role
    await target.roles.remove(jailRole).catch(() => {
      return message.channel.send({ embeds: [fail("Failed to unjail user")] });
    });

    // 📜 logs (UNCHANGED SYSTEM)
    if (logChannel) {
      const embed = log(`<@${target.id}>`, `<@${message.author.id}>`);

      embed.setDescription(
        `**JAIL EVENT**\n• User\n> <@${target.id}>\n• Action\n> unjailed\n• By\n> <@${message.author.id}>`
      );

      logChannel.send({ embeds: [embed] }).catch(() => {});
    }

    // 💬 main response (NO REPLY SYSTEM)
    return message.channel.send({
      embeds: [
        {
          description: `<@${target.id}> has been unjailed.`
        }
      ]
    });
  }
};
