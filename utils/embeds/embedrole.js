const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

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
  base(`**FAILED**\n> ${msg}`);

// ⚖ PERMISSION
const permission = (msg = "Staff Access Required") =>
  base(`**ACCESS DENIED**\n> ${msg}`);

// ➕ ROLE ADDED
const roleAdded = (target, role) =>
  base(`> <@${target.id}> was added to <@&${role.id}>`);

// ➖ ROLE REMOVED
const roleRemoved = (target, role) =>
  base(`> <@${target.id}> was removed from <@&${role.id}>`);

module.exports = {
  fail,
  permission,
  roleAdded,
  roleRemoved
};
