const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

const base = (desc, useFooter = true) => {
  const embed = new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(desc);

  if (useFooter) {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    embed.setFooter({ text: `Today at ${time}` });
  }

  return embed;
};

// ❌ FAIL (keeps footer)
const fail = (msg) =>
  base(`**FAILED**\n> ${msg}`, true);

// ⚖ PERMISSION (keeps footer)
const permission = (msg = "Staff Access Required") =>
  base(`**ACCESS DENIED**\n> ${msg}`, true);

// ➕ ROLE ADDED (NO FOOTER)
const roleAdded = (target, role) =>
  base(`> <@${target.id}> was added to <@&${role.id}>`, false);

// ➖ ROLE REMOVED (NO FOOTER)
const roleRemoved = (target, role) =>
  base(`> <@${target.id}> was removed from <@&${role.id}>`, false);

module.exports = {
  fail,
  permission,
  roleAdded,
  roleRemoved
};
