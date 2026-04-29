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
const permission = (perm = "Permission") =>
  base(
    `**ACCESS DENIED**\n• Required\n> ${perm}`,
    0xE74C3C
  );

// 🔒 SUCCESS
const success = (msg) =>
  base(
    `**SUCCESS**\n• Action\n> ${msg}`,
    0x2ECC71
  );

// ⚖ HIERARCHY USER
const hierarchyUser = (target) =>
  base(
    `**HIERARCHY BLOCKED**\n• Target\n> ${target.user.tag}\n• Status\n> Higher role`,
    0xE74C3C
  );

// 🤖 HIERARCHY BOT
const hierarchyBot = (target) =>
  base(
    `**HIERARCHY BLOCKED**\n• Target\n> ${target.user.tag}\n• Status\n> Bot role too low`,
    0xE74C3C
  );

module.exports = {
  fail,
  permission,
  success,
  hierarchyUser,
  hierarchyBot
};
