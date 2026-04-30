const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

// ⏰ FIXED TIME FORMAT (stable + consistent everywhere)
const time = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

const base = (desc) =>
  new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(desc)
    .setFooter({ text: `Today at ${time()}` });

// ❌ FAIL
const fail = (msg) =>
  base(
    `**FAILED**\n• Reason\n> ${msg}`
  );

// ⚖ PERMISSION
const permission = (perm = "Permission") =>
  base(
    `**ACCESS DENIED**\n• Required\n> ${perm}`
  );

// 🔒 SUCCESS
const success = (msg) =>
  base(
    `**SUCCESS**\n• Action\n> ${msg}`
  );

// ⚖ HIERARCHY USER
const hierarchyUser = (target) =>
  base(
    `**HIERARCHY BLOCKED**\n• Target\n> <@${target.id}>\n• Status\n> Higher role`
  );

// 🤖 HIERARCHY BOT
const hierarchyBot = (target) =>
  base(
    `**HIERARCHY BLOCKED**\n• Target\n> <@${target.id}>\n• Status\n> Bot role too low`
  );

module.exports = {
  fail,
  permission,
  success,
  hierarchyUser,
  hierarchyBot
};
