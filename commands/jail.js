const { EmbedBuilder } = require("discord.js");

const CONFIG = {
  roles: {
    owner: ["1449945270782525502", "1466497373776908353"],
    admin: ["1450022204657111155"],
    jail: "1492118672267939861"
  },

  channels: {
    logs: "1497815554956853359"
  }
};

function isAuthorized(member) {
  return (
    CONFIG.roles.owner.some(id => member.roles.cache.has(id)) ||
    CONFIG.roles.admin.some(id => member.roles.cache.has(id))
  );
}

function logEmbed(title, target, moderator, color) {
  return new EmbedBuilder()
    .setColor(color)
    .setDescription(
      `${title}\n\n👤 Target: ${target.user.tag}\n🛡 Moderator: ${moderator.tag}`
    )
    .setTimestamp();
}

module.exports = {
  name: "jail",
  aliases: ["j", "unjail"],

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const sub = args[0]?.toLowerCase();
    const target = message.mentions.members.first();

    const jailRole = message.guild.roles.cache.get(CONFIG.roles.jail);
    const logChannel = message.guild.channels.cache.get(CONFIG.channels.logs);

    if (!isAuthorized(message.member)) {
      return message.reply("❌ No permission.");
    }

    if (!target) return message.reply("❌ Mention a user.");

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot use this on yourself.");
    }

    if (!jailRole) return message.reply("❌ Jail role not found.");

    if (sub === "unjail" || sub === "remove") {
      await target.roles.remove(jailRole).catch(() => {
        return message.reply("❌ Cannot unjail user.");
      });

      if (logChannel) {
        logChannel.send({
          embeds: [logEmbed("UNJAILED", target, message.author, 0x2ECC71)]
        }).catch(() => {});
      }

      return message.reply(`✅ ${target.user.tag} unjailed.`);
    }

    await target.roles.add(jailRole).catch(() => {
      return message.reply("❌ Cannot jail user.");
    });

    if (logChannel) {
      logChannel.send({
        embeds: [logEmbed("JAILED", target, message.author, 0xE74C3C)]
      }).catch(() => {});
    }

    return message.reply(`🚫 ${target.user.tag} jailed.`);
  }
};
