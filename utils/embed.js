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
// ACTION EMBED (BAN / KICK / MUTE / WARN)
// =========================
const actionEmbed = (action, target, mod) =>
  new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle(action.toUpperCase())
    .setDescription(`${target} was ${action}ed by ${mod}`)
    .setFooter({ text: getTime() });

// =========================
// PURGE EMBED (MESSAGE DELETE SYSTEM)
// =========================
const purgeEmbed = (amount, mod, channel) =>
  new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle("PURGE")
    .setDescription(
      `${amount} messages were deleted in ${channel} by ${mod}`
    )
    .setFooter({ text: getTime() });

// =========================
// WARN EMBED (TRACKING SYSTEM)
// =========================
const warnEmbed = (target, mod, reason, warnCount) =>
  new EmbedBuilder()
    .setColor(GARY_COLOR)
    .setTitle("WARN")
    .setDescription(
      `${target} was warned by ${mod}\nReason: ${reason}`
    )
    .addFields({
      name: "Total Warnings",
      value: `${warnCount}`,
      inline: true
    })
    .setFooter({ text: getTime() });

module.exports = {
  failEmbed,
  permissionEmbed,
  actionEmbed,
  purgeEmbed,
  warnEmbed
};
