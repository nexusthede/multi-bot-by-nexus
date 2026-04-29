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

// 🔧 FIX: make mentions clickable
function mention(input) {
  if (!input) return "Unknown";
  if (typeof input === "string" && (input.startsWith("<@") || input.startsWith("<#"))) {
    return input;
  }
  return `<@${input}>`;
}

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

// 🔒 MAIN ACTION (JAIL) — FIXED MENTIONS
const jailed = (target, moderator) =>
  base(
    `**USER JAILED**\n• Target\n> ${mention(target)}\n• Moderator\n> ${mention(moderator)}`,
    colors.main
  );

// 📜 LOG EMBED — FIXED MENTIONS
const log = (target, moderator) =>
  base(
    `**JAIL EVENT**\n` +
    `• User\n> ${mention(target)}\n` +
    `• Action\n> jailed\n` +
    `• By\n> ${mention(moderator)}`,
    colors.main
  );

module.exports = {
  fail,
  permission,
  jailed,
  log
};
