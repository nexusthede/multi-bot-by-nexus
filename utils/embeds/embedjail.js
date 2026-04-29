const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

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
    colors.main
  );

// ⚖ PERMISSION
const permission = () =>
  base(
    `**ACCESS DENIED**\n• Requirement\n> Admin / Owner`,
    colors.main
  );

// 🔒 MAIN ACTION (JAIL)
const jailed = (target, moderator) =>
  base(
    `**USER JAILED**\n• Target\n> ${target}\n• Moderator\n> ${moderator}`,
    colors.main
  );

// 📜 LOG EMBED
const log = (target, moderator) =>
  base(
    `**JAIL EVENT**\n` +
    `• User\n> ${target}\n` +
    `• Action\n> jailed\n` +
    `• By\n> ${moderator}`,
    colors.main
  );

module.exports = {
  fail,
  permission,
  jailed,
  log
};
