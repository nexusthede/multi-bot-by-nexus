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
  if (action === "MUTE" && duration) text += ` for ${duration}`;

  return new EmbedBuilder()
    .setColor(0x3498DB)
    .setDescription(text + ".")
    .addFields({
      name: "Reason",
      value: reason || "No reason provided"
    });
}

// =========================
// HELPERS
// =========================
const getTarget = (m) => m.mentions.members.first();

// =========================
// COMMAND HANDLER
// =========================
module.exports = {
  name: "moderation",

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const cmd = message.content.slice(1).split(/ +/)[0]?.toLowerCase();
    const target = getTarget(message);

    // =========================
    // REQUIRED CHECK (same style as jail)
    // =========================
    if (["ban","kick","warn","mute","unmute"].includes(cmd)) {
      if (!target)
        return message.reply({ embeds: [failEmbed("Mention a user.")] });

      const check = await hierarchy.canModerate(message.member, target);
      if (!check.ok)
        return message.reply({ embeds: [permissionEmbed(check.reason)] });
    }

    // =========================
    // BAN
    // =========================
    if (cmd === "ban" || cmd === "b") {
      const reason = args.slice(1).join(" ") || "No reason";
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
    // KICK
    // =========================
    if (cmd === "kick" || cmd === "k") {
      const reason = args.slice(1).join(" ") || "No reason";
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
    // WARN
    // =========================
    if (cmd === "warn") {
      const reason = args.slice(1).join(" ") || "No reason";

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
    // MUTE
    // =========================
    if (cmd === "mute" || cmd === "timeout") {
      const time = args[1];
      const reason = args.slice(2).join(" ") || "No reason";

      const ms = convertTime(time);
      if (!ms) return message.reply({ embeds: [failEmbed("Use 10m / 1h / 1d")] });

      await target.timeout(ms, reason);

      return message.reply({
        embeds: [
          successEmbed(`${target.user.tag} was muted.`),
          actionEmbed({
            action: "MUTE",
            target: target.user.tag,
            moderator: message.author.tag,
            reason,
            duration: time
          })
        ]
      });
    }

    // =========================
    // UNMUTE
    // =========================
    if (cmd === "unmute") {
      await target.timeout(null);

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
    // LOCK
    // =========================
    if (cmd === "lock") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      return message.reply({ embeds: [successEmbed("Channel locked.")] });
    }

    // =========================
    // UNLOCK
    // =========================
    if (cmd === "unlock") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true
      });

      return message.reply({ embeds: [successEmbed("Channel unlocked.")] });
    }

    // =========================
    // HIDE / UNHIDE
    // =========================
    if (cmd === "hide") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: false
      });

      return message.reply({ embeds: [successEmbed("Channel hidden.")] });
    }

    if (cmd === "unhide") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: true
      });

      return message.reply({ embeds: [successEmbed("Channel visible.")] });
    }

    // =========================
    // PURGE
    // =========================
    if (cmd === "purge") {
      if (!message.member.permissions.has("ManageMessages"))
        return message.reply({ embeds: [permissionEmbed()] });

      const amount = parseInt(args[1]);
      if (!amount || amount < 1 || amount > 100)
        return message.reply({ embeds: [failEmbed("1–100 messages only.")] });

      await message.channel.bulkDelete(amount, true);

      return message.reply({
        embeds: [successEmbed(`${amount} messages cleared.`)]
      });
    }
  }
};

// helper
function convertTime(str) {
  if (!str) return null;

  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const num = parseInt(match[1]);
  const unit = match[2];

  return {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  }[unit] * num;
}// =========================
    if (cmd === "warn" || cmd === "w") {
      const target = resolveMention(message);
      if (!target) return message.reply({ embeds: [failEmbed("Mention a user.")] });

      const check = await hierarchy.canModerate(message.member, target);
      if (!check.ok) return message.reply({ embeds: [permissionEmbed(check.reason)] });

      const reason = args.slice(1).join(" ") || "No reason";

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
    // LOCK / UNLOCK / HIDE / UNHIDE / PURGE
    // =========================
    if (cmd === "lock") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      return message.reply({ embeds: [successEmbed("Channel locked.")] });
    }

    if (cmd === "unlock") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true
      });

      return message.reply({ embeds: [successEmbed("Channel unlocked.")] });
    }

    if (cmd === "hide") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: false
      });

      return message.reply({ embeds: [successEmbed("Channel hidden.")] });
    }

    if (cmd === "unhide") {
      if (!message.member.permissions.has("ManageChannels"))
        return message.reply({ embeds: [permissionEmbed()] });

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: true
      });

      return message.reply({ embeds: [successEmbed("Channel is now visible.")] });
    }

    if (cmd === "purge" || cmd === "clear" || cmd === "c") {
      if (!message.member.permissions.has("ManageMessages"))
        return message.reply({ embeds: [permissionEmbed()] });

      const amount = parseInt(args[1]);
      if (!amount || amount < 1 || amount > 100)
        return message.reply({ embeds: [failEmbed("Enter 1–100 messages.")] });

      await message.channel.bulkDelete(amount, true);

      return message.reply({ embeds: [successEmbed(`${amount} messages cleared.`)] });
    }
  }
};
