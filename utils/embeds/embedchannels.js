const { EmbedBuilder } = require("discord.js");

// 🔴 ERROR COLOR ONLY
const errorColor = 0xED4245;

// 📌 CHANNEL ACTIONS (DEFAULT GRAY - NO setColor)
function lock(channel) {
  return new EmbedBuilder()
    .setDescription(`#${channel} has been locked`);
}

function unlock(channel) {
  return new EmbedBuilder()
    .setDescription(`#${channel} has been unlocked`);
}

function hide(channel) {
  return new EmbedBuilder()
    .setDescription(`#${channel} is now hidden`);
}

function unhide(channel) {
  return new EmbedBuilder()
    .setDescription(`#${channel} is now visible`);
}

// ❌ FAIL (RED)
function fail(reason) {
  return new EmbedBuilder()
    .setColor(errorColor)
    .setDescription(`FAILED\n• Reason\n> ${reason}`);
}

// ⚖ PERMISSION (RED)
function permission() {
  return new EmbedBuilder()
    .setColor(errorColor)
    .setDescription(`ACCESS DENIED\n• Status\n> Missing permissions`);
}

module.exports = {
  lock,
  unlock,
  hide,
  unhide,
  fail,
  permission
};
