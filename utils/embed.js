const { EmbedBuilder } = require("discord.js");

// =========================
// GARY COLOR (GLOBAL THEME)
// =========================
const GARY_COLOR = 0x808080;

// =========================
// TIME
// =========================
const getTime = () =>
  `Today at ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;

// =========================
// FAILED EMBED
// =========================
const failEmbed = (text) =>
  new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle("FAILED")
    .setDescription(text)
    .setFooter({ text: getTime() });

// =========================
// PERMISSION EMBED
// =========================
const permissionEmbed = (perm) =>
  new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle("PERMISSION")
    .setDescription(
      `> You are missing required permission\n> \`${perm}\``
    )
    .setFooter({ text: getTime() });

// =========================
// ACTION EMBED (BAN / KICK / MUTE / UNMUTE / WARN)
// =========================
const actionEmbed = (action, target, mod) => {
  const verbs = {
    ban: "banned",
    kick: "kicked",
    mute: "muted",
    unmute: "unmuted",
    warn: "warned"
  };

  return new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle(action.toUpperCase())
    .setDescription(
      `${target.user ? target.user.tag : target} was ${verbs[action] || action} by ${mod}`
    )
    .setFooter({ text: getTime() });
};

// =========================
// PURGE EMBED
// =========================
const purgeEmbed = (amount, mod, channel) =>
  new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle("PURGE")
    .setDescription(
      `${amount} messages were deleted in #${channel.name} by ${mod}`
    )
    .setFooter({ text: getTime() });

// =========================
// WARN EMBED (MONGODB READY)
// =========================
const warnEmbed = (target, mod, reason, warnCount) =>
  new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle("WARN")
    .setDescription(
      `${target.user ? target.user.tag : target} was warned by ${mod}\nReason: ${reason}`
    )
    .addFields({
      name: "Total Warnings",
      value: `${warnCount}`,
      inline: true
    })
    .setFooter({ text: getTime() });

// =========================
// EXPORTS
// =========================
module.exports = {
  failEmbed,
  permissionEmbed,
  actionEmbed,
  purgeEmbed,
  warnEmbed
};
