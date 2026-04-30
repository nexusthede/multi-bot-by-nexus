const { EmbedBuilder } = require("discord.js");
const colors = require("./colors");

// 📌 CHANNEL ACTIONS (UNIVERSAL COLOR)
function lock(channelId) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`> <#${channelId}> has been locked`);
}

function unlock(channelId) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`> <#${channelId}> has been unlocked`);
}

function hide(channelId) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`> <#${channelId}> is now hidden`);
}

function unhide(channelId) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`> <#${channelId}> is now visible`);
}

// ❌ FAIL
function fail(reason) {
  return new EmbedBuilder()
    .setColor(colors.main)
    .setDescription(`FAILED\n• Reason\n> ${reason}`);
}

// ⚖ PERMISSION
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
