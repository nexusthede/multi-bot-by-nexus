const { EmbedBuilder } = require("discord.js");

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
// COMMAND
// =========================
module.exports = {
  name: "jail",

  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    const target = getTarget(message);

    const jailRole = message.guild.roles.cache.get(CONFIG.roles.jail);
    const logChannel = message.guild.channels.cache.get(CONFIG.channels.logs);

    // =========================
    // PERMISSION CHECK
    // =========================
    if (!isAuthorized(message.member)) {
      return message.reply("You don’t have permission to use this command.");
    }

    // =========================
    // NO TARGET
    // =========================
    if (!target) {
      return message.reply("Mention a user.");
    }

    // =========================
    // SELF PROTECTION
    // =========================
    if (target.id === message.author.id) {
      return message.reply("You cannot use this on yourself.");
    }

    // =========================
    // BOT PROTECTION (optional safety)
    // =========================
    if (target.user.bot) {
      return message.reply("You cannot use this on bots.");
    }

    // =========================
    // JAIL COMMAND
    // =========================
    if (!sub || sub === "add") {
      if (!jailRole) return message.reply("Jail role not set.");

      await target.roles.add(jailRole).catch(() => {
        return message.reply("I cannot jail this user.");
      });

      if (logChannel) {
        logChannel.send(
          `🚫 ${target.user.tag} was jailed by ${message.author.tag}`
        );
      }

      return message.reply(`${target.user.tag} has been jailed.`);
    }

    // =========================
    // UNJAIL COMMAND
    // =========================
    if (sub === "remove" || sub === "unjail") {
      if (!jailRole) return message.reply("Jail role not set.");

      await target.roles.remove(jailRole).catch(() => {
        return message.reply("I cannot unjail this user.");
      });

      if (logChannel) {
        logChannel.send(
          `✅ ${target.user.tag} was unjailed by ${message.author.tag}`
        );
      }

      return message.reply(`${target.user.tag} has been unjailed.`);
    }

    // =========================
    // INVALID SUBCOMMAND
    // =========================
    return message.reply("Use: .jail @user OR .jail unjail @user");
  }
};
