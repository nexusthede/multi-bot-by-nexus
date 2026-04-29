const { EmbedBuilder } = require("discord.js");

const time = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

const base = (desc, color) =>
  new EmbedBuilder()
    .setColor(color)
    .setDescription(desc)
    .setFooter({ text: `Today at ${time()}` });

// ❌ FAIL
const fail = (msg) =>
  base(
    `**FAILED**\n• Reason\n> ${msg}`,
    0xE74C3C
  );

// ⚖ PERMISSION
const permission = () =>
  base(
    `**ACCESS DENIED**\n• Requirement\n> Admin / Owner`,
    0xE74C3C
  );

// 🔒 MAIN ACTION
const jailed = (target, moderator) =>
  base(
    `**USER JAILED**\n• Target\n> ${target}\n• Moderator\n> ${moderator}`,
    0xE74C3C
  );

// 📜 CLEAN LOG STYLE (THIS IS THE GOOD ONE)
const log = (target, moderator) =>
  base(
    `**JAIL EVENT**\n` +
    `• User\n> ${target}\n` +
    `• Action\n> jailed\n` +
    `• By\n> ${moderator}`,
    0x2F3136
  );

module.exports = {
  fail,
  permission,
  jailed,
  log
};
