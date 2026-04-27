const { EmbedBuilder } = require("discord.js");
const hierarchy = require("../hierarchy");

// =========================
// EMBEDS
// =========================
function successEmbed(text) {
  return new EmbedBuilder().setColor(0x2ECC71).setDescription(text);
}

function failEmbed(text) {
  return new EmbedBuilder().setColor(0xE74C3C).setDescription(text || "That didn’t work.");
}

function permissionEmbed(text) {
  return new EmbedBuilder().setColor(0xF1C40F).setDescription(text || "You don’t have permission to do that.");
}

// =========================
// ACTION EMBED
// =========================
function actionEmbed({ action, target, moderator, reason, duration }) {
  const map = {
    BAN: "was banned",
    UNBAN: "was unbanned",
    KICK: "was kicked",
    WARN: "was warned",
    MUTE: "was muted",
    UNMUTE: "was unmuted"
  };

  let text = `${target} ${map[action] || "was moderated"} by ${moderator}`;

  if (action === "MUTE" && duration) {
    text += ` for ${duration}`;
  }

  return new EmbedBuilder()
    .setColor(0x3498DB)
    .setDescription(`${text}.`)
    .addFields({
      name: "Reason",
      value: reason || "No reason provided",
      inline: false
    });
}

// =========================
// STRICT HELPERS
// =========================

// ONLY mentions allowed
function resolveMention(message) {
  return message.mentions.members.first() || null;
}

// ONLY ID allowed (unban)
function resolveId(input) {
  return /^\d{17,20}$/.test(input) ? input : null;
}

// TIME PARSER
function parseTime(input) {
  if (!/^(\d+)(s|m|h|d)$/.test(input)) return null;

  const value = parseInt(input.slice(0, -1));
  const unit = input.slice(-1);

  const map = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };

  return value * map[unit];
}

// =========================
// MAIN HANDLER
// =========================
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;

  const prefix = ".";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  if (!cmd) return;

  // =========================
  // BAN
  // =========================
  if (cmd === "ban" || cmd === "b") {
    const target = resolveMention(message);
    if (!target) return message.reply({ embeds: [failEmbed("Mention a user.")] });

    const check = await hierarchy.canModerate(message.member, target);
    if (!check.ok) return message.reply({ embeds: [permissionEmbed(check.reason)] });

    const reason = args.join(" ") || "No reason";

    await target.ban({ reason });

    return message.reply({
      embeds: [
        successEmbed(`${target.user.tag} was banned.`),
        actionEmbed({
          action: "BAN",
          target: target.user.tag,
          moderator: message.author.tag,
          reason
        })
      ]
    });
  }

  // =========================
  // UNBAN (ID ONLY)
  // =========================
  if (cmd === "unban" || cmd === "ub") {
    const id = resolveId(args[0]);
    if (!id) return message.reply({ embeds: [failEmbed("Provide a valid user ID.")] });

    try {
      await message.guild.members.unban(id);

      return message.reply({
        embeds: [
          successEmbed("User was unbanned."),
          actionEmbed({
            action: "UNBAN",
            target: `<@${id}>`,
            moderator: message.author.tag,
            reason: args.slice(1).join(" ") || "No reason"
          })
        ]
      });
    } catch {
      return message.reply({ embeds: [failEmbed("User is not banned or cannot be unbanned.")] });
    }
  }

  // =========================
  // KICK
  // =========================
  if (cmd === "kick" || cmd === "k") {
    const target = resolveMention(message);
    if (!target) return message.reply({ embeds: [failEmbed("Mention a user.")] });

    const check = await hierarchy.canModerate(message.member, target);
    if (!check.ok) return message.reply({ embeds: [permissionEmbed(check.reason)] });

    const reason = args.join(" ") || "No reason";

    await target.kick(reason);

    return message.reply({
      embeds: [
        successEmbed(`${target.user.tag} was kicked.`),
        actionEmbed({
          action: "KICK",
          target: target.user.tag,
          moderator: message.author.tag,
          reason
        })
      ]
    });
  }

  // =========================
  // MUTE
  // =========================
  if (cmd === "mute" || cmd === "timeout" || cmd === "tm") {
    const target = resolveMention(message);
    if (!target) return message.reply({ embeds: [failEmbed("Mention a user.")] });

    const time = parseTime(args[0]);
    if (!time) return message.reply({ embeds: [failEmbed("Invalid time format (10m, 1h, etc).")] });

    const reason = args.slice(1).join(" ") || "No reason";

    const check = await hierarchy.canModerate(message.member, target);
    if (!check.ok) return message.reply({ embeds: [permissionEmbed(check.reason)] });

    await target.timeout(time, reason).catch(() => {
      return message.reply({ embeds: [failEmbed("I cannot mute this user.")] });
    });

    return message.reply({
      embeds: [
        successEmbed(`${target.user.tag} was muted.`),
        actionEmbed({
          action: "MUTE",
          target: target.user.tag,
          moderator: message.author.tag,
          reason,
          duration: args[0]
        })
      ]
    });
  }

  // =========================
  // UNMUTE
  // =========================
  if (cmd === "unmute" || cmd === "untimeout") {
    const target = resolveMention(message);
    if (!target) return message.reply({ embeds: [failEmbed("Mention a user.")] });

    const check = await hierarchy.canModerate(message.member, target);
    if (!check.ok) return message.reply({ embeds: [permissionEmbed(check.reason)] });

    await target.timeout(null).catch(() => {
      return message.reply({ embeds: [failEmbed("I cannot unmute this user.")] });
    });

    return message.reply({
      embeds: [
        successEmbed(`${target.user.tag} was unmuted.`),
        actionEmbed({
          action: "UNMUTE",
          target: target.user.tag,
          moderator: message.author.tag,
          reason: "Manual removal"
        })
      ]
    });
  }

  // =========================
  // WARN
  // =========================
  if (cmd === "warn" || cmd === "w") {
    const target = resolveMention(message);
    if (!target) return message.reply({ embeds: [failEmbed("Mention a user.")] });

    const check = await hierarchy.canModerate(message.member, target);
    if (!check.ok) return message.reply({ embeds: [permissionEmbed(check.reason)] });

    const reason = args.join(" ") || "No reason";

    if (!global.warns) global.warns = {};
    if (!global.warns[target.id]) global.warns[target.id] = [];

    global.warns[target.id].push({
      reason,
      mod: message.author.id,
      time: Date.now()
    });

    return message.reply({
      embeds: [
        successEmbed(`${target.user.tag} was warned.`),
        actionEmbed({
          action: "WARN",
          target: target.user.tag,
          moderator: message.author.tag,
          reason
        })
      ]
    });
  }

  // =========================
  // LOCK
  // =========================
  if (cmd === "lock" || cmd === "l") {
    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply({ embeds: [permissionEmbed()] });
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    });

    return message.reply({ embeds: [successEmbed("Channel locked.")] });
  }

  // =========================
  // UNLOCK
  // =========================
  if (cmd === "unlock" || cmd === "ul") {
    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply({ embeds: [permissionEmbed()] });
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: true
    });

    return message.reply({ embeds: [successEmbed("Channel unlocked.")] });
  }

  // =========================
  // HIDE
  // =========================
  if (cmd === "hide" || cmd === "h") {
    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply({ embeds: [permissionEmbed()] });
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      ViewChannel: false
    });

    return message.reply({ embeds: [successEmbed("Channel hidden.")] });
  }

  // =========================
  // UNHIDE
  // =========================
  if (cmd === "unhide" || cmd === "uh") {
    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply({ embeds: [permissionEmbed()] });
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      ViewChannel: true
    });

    return message.reply({ embeds: [successEmbed("Channel is now visible.")] });
  }

  // =========================
  // PURGE
  // =========================
  if (cmd === "purge" || cmd === "clear" || cmd === "c" || cmd === "clean") {
    if (!message.member.permissions.has("ManageMessages")) {
      return message.reply({ embeds: [permissionEmbed()] });
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply({ embeds: [failEmbed("Enter 1–100 messages.")] });
    }

    await message.channel.bulkDelete(amount, true).catch(() => {});

    return message.reply({ embeds: [successEmbed(`${amount} messages cleared.`)] });
  }
};
