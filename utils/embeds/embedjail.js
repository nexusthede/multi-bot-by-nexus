const { EmbedBuilder } = require("discord.js");

const time = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

const base = (desc, color = null) =>
  new EmbedBuilder()
    .setColor(color)
    .setDescription(desc)
    .setFooter({ text: `Today at ${time()}` });

// ❌ FAIL
const fail = (msg) =>
  base(`**FAILED**\n• Reason:\n> ${msg}`, 0xE74C3C);

// ⚖ PERMISSION
const permission = () =>
  base(`**PERMISSION DENIED**\n• Required:\n> Admin / Owner`, 0xE74C3C);

// 🔒 JAILED
const jailed = (target, moderator) =>
  base(
    `**JAILED**\n• User:\n> ${target.user.tag}\n• Moderator:\n> ${moderator.tag}`,
    0xE74C3C
  );

// 📜 LOG
const log = (target, moderator) =>
  base(
    `**JAIL LOG**\n• Target:\n> ${target.user.tag}\n• Moderator:\n> ${moderator.tag}`,
    0x5865F2
  );

module.exports = {
  fail,
  permission,
  jailed,
  log
};
