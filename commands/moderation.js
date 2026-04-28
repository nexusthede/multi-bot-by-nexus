const { EmbedBuilder } = require("discord.js");

// =========================
// CONFIG
// =========================
const CONFIG = {
  roles: {
    owner: ["1449945270782525502", "1466497373776908353"],
    admin: ["1450022204657111155"],
    mod: ["1465960511375151288", "1468316755847024730"]
  }
};

// =========================
// AUTH
// =========================
function getTier(member) {
  if (!member) return 0;

  if (CONFIG.roles.owner.some(r => member.roles.cache.has(r))) return 3;
  if (CONFIG.roles.admin.some(r => member.roles.cache.has(r))) return 2;
  if (CONFIG.roles.mod.some(r => member.roles.cache.has(r))) return 1;

  return 0;
}

function canUseMod(member) {
  return getTier(member) > 0;
}

// =========================
// HIERARCHY
// =========================
function canModerate(mod, target) {
  if (!mod || !target) return false;
  if (mod.id === target.id) return false;

  const modPos = mod.roles.highest.position;
  const targetPos = target.roles.highest.position;

  if (modPos <= targetPos && getTier(mod) !== 3) return false;

  return true;
}

// =========================
// EMBEDS
// =========================
function success(title, desc) {
  return new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(title)
    .setDescription(desc)
    .setTimestamp();
}

function fail(desc) {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle("FAILED")
    .setDescription(desc)
    .setTimestamp();
}

function perm(desc) {
  return new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle("PERMISSION")
    .setDescription(desc)
    .setTimestamp();
}

// =========================
// COMMAND SYSTEM (WORKS WITH YOUR INDEX)
// =========================
module.exports = {
  name: "moderation",

  async execute(message, args) {
    const cmd = args[0]?.toLowerCase();
    args.shift();

    const target = message.mentions.members.first();

    const allowed = ["ban", "kick", "warn", "mute", "unmute", "b", "k", "w"];
    if (!allowed.includes(cmd)) return;

    if (!canUseMod(message.member)) {
      return message.reply({
        embeds: [perm("You do not have permission.")]
      });
    }

    if (!target) {
      return message.reply({
        embeds: [fail("Mention a user.")]
      });
    }

    if (!canModerate(message.member, target)) {
      return message.reply({
        embeds: [perm("You cannot moderate this user.")]
      });
    }

    // =========================
    // BAN
    // =========================
    if (cmd === "ban" || cmd === "b") {
      await target.ban().catch(() => {});
      return message.reply({
        embeds: [
          success("BAN", `${target} was banned by <@${message.author.id}>`)
        ]
      });
    }

    // =========================
    // KICK
    // =========================
    if (cmd === "kick" || cmd === "k") {
      await target.kick().catch(() => {});
      return message.reply({
        embeds: [
          success("KICK", `${target} was kicked by <@${message.author.id}>`)
        ]
      });
    }

    // =========================
    // WARN (MEMORY ONLY)
    // =========================
    if (cmd === "warn" || cmd === "w") {
      if (!message.guild.warns) message.guild.warns = {};
      if (!message.guild.warns[target.id]) message.guild.warns[target.id] = [];

      message.guild.warns[target.id].push({
        mod: message.author.id,
        reason: args.join(" ") || "No reason",
        time: Date.now()
      });

      return message.reply({
        embeds: [
          success("WARN", `${target} was warned by <@${message.author.id}>`)
        ]
      });
    }

    // =========================
    // MUTE
    // =========================
    if (cmd === "mute") {
      const time = args[0];
      if (!time) return message.reply({ embeds: [fail("Use 10m / 1h / 1d")] });

      const ms =
        time.endsWith("m")
          ? parseInt(time) * 60000
          : time.endsWith("h")
          ? parseInt(time) * 3600000
          : parseInt(time) * 86400000;

      await target.timeout(ms).catch(() => {});

      return message.reply({
        embeds: [
          success("MUTE", `${target} was muted by <@${message.author.id}>`)
        ]
      });
    }

    // =========================
    // UNMUTE
    // =========================
    if (cmd === "unmute") {
      await target.timeout(null).catch(() => {});

      return message.reply({
        embeds: [
          success("UNMUTE", `${target} was unmuted by <@${message.author.id}>`)
        ]
      });
    }
  }
};
