const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

// 📌 CHANNEL ACTIONS (UNIVERSAL COLOR)
function lock(channel) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`#${channel} has been locked`);
}

function unlock(channel) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`#${channel} has been unlocked`);
}

function hide(channel) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`#${channel} is now hidden`);
}

function unhide(channel) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`#${channel} is now visible`);
}

// ❌ FAIL (NOW ALSO UNIVERSAL COLOR)
function fail(reason) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`FAILED\n• Reason\n> ${reason}`);
}

// ⚖ PERMISSION (ALSO UNIVERSAL COLOR)
function permission() {
  return new EmbedBuilder()
    .setColor(colors.main)
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
