const { EmbedBuilder, PermissionsBitField } = require("discord.js");

// =========================
// STAFF TIERS
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

// =========================
// ROLE / TIER SYSTEM
// =========================
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

  if (modPos < targetPos) {
    return { ok: false, reason: "Your role is too low to moderate this user." };
  }

  const warning = modPos === targetPos;

  const ACTION_POWER = {
    ban: 3,
    kick: 2,
    mute: 1,
    warn: 0
  };

  if (modTier < (ACTION_POWER[action] ?? 0) && modTier !== TIERS.OWNER) {
    return {
      ok: false,
      reason: "You do not have enough staff power for this action."
    };
  }

  return { ok: true, warning };
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
    return { ok: true };
  } catch (err) {
    console.error("MOD ERROR:", err);
    return { ok: false };
  }
}

// =========================
// EMBEDS (UNCHANGED STYLE)
// =========================
function actionEmbed(action, targetId, modId, duration) {
  const MAP = {
    ban: "BANNED",
    kick: "KICKED",
    warn: "WARNED",
    mute: "MUTED",
    unmute: "UNMUTED"
  };

  let desc = `<@${targetId}> was ${MAP[action].toLowerCase()} by <@${modId}>`;

  if (action === "mute" && duration) {
    desc += ` for ${duration}`;
  }

  return new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(MAP[action])
    .setDescription(desc)
    .setTimestamp();
}

function failEmbed(text) {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle("FAILED")
    .setDescription(text || "Action failed.")
    .setTimestamp();
}

function permissionEmbed(text) {
  return new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle("PERMISSION")
    .setDescription(text || "You do not have permission.")
    .setTimestamp();
}

// =========================
// COMMAND HANDLER
// =========================
module.exports = {
  name: "moderation",

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const cmdRaw = message.content.slice(1).split(/ +/)[0]?.toLowerCase();

    // =========================
    // ALIASES FIXED HERE
    // =========================
    const aliases = {
      b: "ban",
      k: "kick",
      w: "warn",
      tm: "mute",
      timeout: "mute",
      um: "unmute"
    };

    const cmd = aliases[cmdRaw] || cmdRaw;

    if (checkCooldown(message.author.id, cmd)) return;

    const target = message.mentions.members.first();

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
    if (cmd === "ban") {
      await safeRun(() => target.ban());
      return message.reply({ embeds: [actionEmbed("ban", target.id, message.author.id)] });
    }

    // =========================
    // KICK
    // =========================
    if (cmd === "kick") {
      await safeRun(() => target.kick());
      return message.reply({ embeds: [actionEmbed("kick", target.id, message.author.id)] });
    }

    // =========================
    // WARN
    // =========================
    if (cmd === "warn") {
      if (!global.warns) global.warns = {};
      if (!global.warns[target.id]) global.warns[target.id] = [];

      global.warns[target.id].push({
        mod: message.author.id,
        time: Date.now()
      });

      return message.reply({
        embeds: [actionEmbed("warn", target.id, message.author.id)]
      });
    }

    // =========================
    // MUTE
    // =========================
    if (cmd === "mute") {
      const time = args[1];
      if (!time) return message.reply({ embeds: [failEmbed("Use 10m / 1h / 1d")] });

      const ms =
        time.endsWith("m")
          ? parseInt(time) * 60000
          : time.endsWith("h")
          ? parseInt(time) * 3600000
          : parseInt(time) * 86400000;

      await safeRun(() => target.timeout(ms));

      return message.reply({
        embeds: [actionEmbed("mute", target.id, message.author.id, time)]
      });
    }

    // =========================
    // UNMUTE
    // =========================
    if (cmd === "unmute") {
      await safeRun(() => target.timeout(null));

      return message.reply({
        embeds: [actionEmbed("unmute", target.id, message.author.id)]
      });
    }
  }
};
