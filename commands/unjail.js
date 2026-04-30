const {
  fail,
  permission,
  log
} = require("../utils/embeds/embedjail");

const { canUse } = require("../utils/perms");

module.exports = {
  name: "unjail",
  aliases: ["uj"],

  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const target = message.mentions.members.first();

    const jailRole = message.guild.roles.cache.get("1492118672267939861");
    const logChannel = message.guild.channels.cache.get("1497815554956853359");

    if (!target)
      return message.channel.send({
        embeds: [fail("No user mentioned")]
      });

    // 🔐 CENTRAL PERMISSION CHECK
    if (!canUse(message.member, "jail"))
      return message.channel.send({
        embeds: [permission("Owner / Admin Access Required")]
      });

    if (!jailRole)
      return message.channel.send({
        embeds: [fail("Jail role not found")]
      });

    if (!target.roles.cache.has(jailRole.id))
      return message.channel.send({
        embeds: [fail("User is not jailed")]
      });

    try {
      await target.roles.remove(jailRole);
    } catch (err) {
      console.log("UNJAIL ERROR:", err);
      return message.channel.send({
        embeds: [fail("Failed to unjail user")]
      });
    }

    // 📜 LOGS (UNCHANGED)
    if (logChannel) {
      const embed = log(`<@${target.id}>`, `<@${message.author.id}>`);

      embed.setDescription(
        `**JAIL EVENT**\n• User\n> <@${target.id}>\n• Action\n> unjailed\n• By\n> <@${message.author.id}>`
      );

      logChannel.send({ embeds: [embed] }).catch(() => {});
    }

    // 💬 RESPONSE (UNCHANGED STYLE)
    return message.channel.send({
      embeds: [
        {
          description: `> <@${target.id}> has been unjailed.`
        }
      ]
    });
  }
};
