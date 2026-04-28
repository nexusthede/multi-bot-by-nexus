const { EmbedBuilder } = require("discord.js");

// =========================
// STAFF TIER SYSTEM
// =========================
const TIERS = {
  OWNER: 3,
  ADMIN: 2,
  MOD: 1
};

const ROLE_TIERS = {
  "1449945270782525502": TIERS.OWNER,
  "1466497373776908353": TIERS.OWNER,

  "1450022204657111155": TIERS.ADMIN,

  "1465960511375151288": TIERS.MOD,
  "1468316755847024730": TIERS.MOD
};

function getTier(member) {
  if (!member?.roles?.cache) return 0;

  let highest = 0;
  for (const role of member.roles.cache.values()) {
    const tier = ROLE_TIERS[role.id];
    if (tier && tier > highest) highest = tier;
  }
  return highest;
}

function canUseMod(member) {
  return getTier(member) > 0;
}

// =========================
// HIERARCHY
// =========================
function canModerate(mod, target, action = "default") {
  if (!mod || !target) return { ok: false, reason: "Invalid user." };
  if (mod.id === target.id) return { ok: false, reason: "You cannot moderate yourself." };

  const modTier = getTier(mod);
  const targetTier = getTier(target);

  const modPos = mod.roles?.highest?.position ?? 0;
  const targetPos = target.roles?.highest?.position ?? 0;

  if (modTier === TIERS.OWNER) return { ok: true };

  if (targetTier >= TIERS.ADMIN && modTier < TIERS.OWNER) {
    return { ok: false, reason: "You cannot moderate staff members." };
  }

  if (modPos <= targetPos) {
    return { ok: false, reason: "Your role is too low to moderate this user." };
  }

  const ACTION_POWER = {
    ban: 3,
    kick: 2,
    mute: 1,
    warn: 0
  };

  if (modTier < (ACTION_POWER[action] ?? 0) && modTier !== TIERS.OWNER) {
    return {
      ok: false,
      reason: "You do not have enough permission power."
    };
  }

  return { ok: true };
}

// =========================
// COOLDOWN
// =========================
const cooldowns = new Map();

function checkCooldown(userId, cmd, time = 2000) {
  const key = `${userId}-${cmd}`;
  const now = Date.now();

  const expire = cooldowns.get(key);
  if (expire && expire > now) return true;

  cooldowns.set(key, now + time);
  setTimeout(() => cooldowns.delete(key), time);

  return false;
}

// =========================
// SAFE RUN
// =========================
async function safeRun(fn) {
  try {
    await fn();
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// =========================
// EMBEDS
// =========================
function successEmbed(text, title = "SUCCESS") {
  return new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(title)
    .setDescription(text)
    .setTimestamp();
}

function failEmbed(text) {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle("FAILED")
    .setDescription(text)
    .setTimestamp();
}

function permissionEmbed(text) {
  return new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle("PERMISSION")
    .setDescription(text)
    .setTimestamp();
}

// =========================
// COMMAND
// =========================
module.exports = {
  name: "moderation",

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    // =========================
    // CLEAN COMMAND (IMPORTANT FIX)
    // =========================
    const cmd = args[0]?.toLowerCase();
    if (!cmd) return;

    args.shift();

    if (checkCooldown(message.author.id, cmd)) return;

    const target = message.mentions.members.first();

    // =========================
    // BASIC PERMISSION
    // =========================
    if (!canUseMod(message.member)) {
      return message.reply({
        embeds: [permissionEmbed("You do not have permission to use moderation commands.")]
      });
    }

    const needsTarget = ["ban", "kick", "warn", "mute", "unmute"];

    if (needsTarget.includes(cmd) && !target) {
      return message.reply({ embeds: [failEmbed("Mention a user.")] });
    }

    const check = canModerate(message.member, target, cmd);

    if (needsTarget.includes(cmd) && !check.ok) {
      return message.reply({
        embeds: [permissionEmbed(check.reason)]
      });
    }

    // =========================
    // BAN
    // =========================
    if (cmd === "ban" || cmd === "b") {
      await safeRun(() => target.ban());
      return message.reply({
        embeds: [successEmbed(`${target.user.tag} was banned by <@${message.author.id}>`, "BAN")]
      });
    }

    // =========================
    // KICK
    // =========================
    if (cmd === "kick" || cmd === "k") {
      await safeRun(() => target.kick());
      return message.reply({
        embeds: [successEmbed(`${target.user.tag} was kicked by <@${message.author.id}>`, "KICK")]
      });
    }

    // =========================
    // WARN
    // =========================
    if (cmd === "warn" || cmd === "w") {
      if (!global.warns) global.warns = {};
      if (!global.warns[target.id]) global.warns[target.id] = [];

      global.warns[target.id].push({
        mod: message.author.id,
        time: Date.now()
      });

      return message.reply({
        embeds: [successEmbed(`${target.user.tag} was warned by <@${message.author.id}>`, "WARN")]
      });
    }

    // =========================
    // MUTE
    // =========================
    if (cmd === "mute" || cmd === "tm" || cmd === "timeout") {
      const time = args[0];
      if (!time) return message.reply({ embeds: [failEmbed("Use 10m / 1h / 1d")] });

      const ms =
        time.endsWith("m")
          ? parseInt(time) * 60000
          : time.endsWith("h")
          ? parseInt(time) * 3600000
          : parseInt(time) * 86400000;

      await safeRun(() => target.timeout(ms));

      return message.reply({
        embeds: [successEmbed(`${target.user.tag} was muted by <@${message.author.id}>`, "MUTE")]
      });
    }

    // =========================
    // UNMUTE
    // =========================
    if (cmd === "unmute" || cmd === "um") {
      await safeRun(() => target.timeout(null));

      return message.reply({
        embeds: [successEmbed(`${target.user.tag} was unmuted by <@${message.author.id}>`, "UNMUTE")]
      });
    }
  }
};
