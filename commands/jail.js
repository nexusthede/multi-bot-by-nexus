const { EmbedBuilder } = require("discord.js");
const hierarchy = require("../hierarchy");

// =========================
// CONFIG
// =========================
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

// =========================
// HELPERS
// =========================
function isOwner(member) {
  return CONFIG.roles.owner.some(id => member.roles.cache.has(id));
}

function isAdmin(member) {
  return CONFIG.roles.admin.some(id => member.roles.cache.has(id));
}

function isAuthorized(member) {
  return isOwner(member) || isAdmin(member);
}

function getTarget(message) {
  return message.mentions.members.first();
}

// =========================
// EMBED
// =========================
function logEmbed(title, target, moderator, color) {
  return new EmbedBuilder()
    .setColor(color)
    .setDescription(
      `${title}\n\n👤 Target: ${target.user.tag}\n🛡 Moderator: ${moderator.tag}`
    )
    .setTimestamp();
}

// =========================
// COMMAND
// =========================
module.exports = {
  name: "jail",

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const sub = args[0]?.toLowerCase();
    const target = getTarget(message);

    const jailRole = message.guild.roles.cache.get(CONFIG.roles.jail);
    const logChannel = message.guild.channels.cache.get(CONFIG.channels.logs);

    // =========================
    // PERMISSION CHECK
    // =========================
    if (!isAuthorized(message.member)) {
      return message.reply("❌ You don’t have permission to use this command.");
    }

    // =========================
    // TARGET CHECK
    // =========================
    if (!target) {
      return message.reply("❌ Mention a user.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot use this on yourself.");
    }

    if (target.user.bot) {
      return message.reply("❌ You cannot use this on bots.");
    }

    // =========================
    // JAIL
    // =========================
    if (!sub || sub === "add") {
      if (!jailRole) return message.reply("❌ Jail role not set.");

      await target.roles.add(jailRole).catch(() => {
        return message.reply("❌ I cannot jail this user.");
      });

      if (logChannel) {
        logChannel.send({
          embeds: [
            logEmbed("🚫 USER JAILED", target, message.author, 0xE74C3C)
          ]
        }).catch(() => {});
      }

      return message.reply(`🚫 ${target.user.tag} has been jailed.`);
    }

    // =========================
    // UNJAIL
    // =========================
    if (sub === "remove" || sub === "unjail") {
      if (!jailRole) return message.reply("❌ Jail role not set.");

      await target.roles.remove(jailRole).catch(() => {
        return message.reply("❌ I cannot unjail this user.");
      });

      if (logChannel) {
        logChannel.send({
          embeds: [
            logEmbed("✅ USER UNJAILED", target, message.author, 0x2ECC71)
          ]
        }).catch(() => {});
      }

      return message.reply(`✅ ${target.user.tag} has been unjailed.`);
    }

    // =========================
    // INVALID
    // =========================
    return message.reply("❌ Use: `.jail @user` or `.jail unjail @user`");
  }
};
