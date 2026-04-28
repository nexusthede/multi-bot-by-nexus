const { EmbedBuilder } = require("discord.js");

// =========================
// STAFF SYSTEM
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
// HIERARCHY CHECK
// =========================
function canModerate(mod, target) {
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
    return { ok: false, reason: "Your role is too low." };
  }

  return { ok: true };
}

// =========================
// COOLDOWN (BIG SERVER SAFE)
// =========================
const cooldowns = new Map();

function checkCooldown(userId, cmd) {
  const key = `${userId}-${cmd}`;
  const now = Date.now();

  const expire = cooldowns.get(key);
  if (expire && expire > now) return true;

  cooldowns.set(key, now + 2000);
  setTimeout(() => cooldowns.delete(key), 2000);

  return false;
}

// =========================
// EMBEDS (CONSISTENT)
// =========================
function success(title, desc) {
  return new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(`SUCCESS - ${title}`)
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
// MESSAGE CREATE MODERATION
// =========================
module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(".")) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const cmd = args.shift()?.toLowerCase();
    if (!cmd) return;

    const target = message.mentions.members.first();

    const commands = ["ban", "kick", "warn", "mute", "unmute", "b", "k", "w"];

    if (!commands.includes(cmd)) return;

    if (checkCooldown(message.author.id, cmd)) return;

    if (!canUseMod(message.member)) {
      return message.reply({
        embeds: [perm("You lack moderation permission.")]
      });
    }

    if (!target) {
      return message.reply({
        embeds: [fail("You must mention a user.")]
      });
    }

    const check = canModerate(message.member, target);

    if (!check.ok) {
      return message.reply({
        embeds: [perm(check.reason)]
      });
    }

    // =========================
    // BAN
    // =========================
    if (cmd === "ban" || cmd === "b") {
      await target.ban().catch(() => {});
      return message.reply({
        embeds: [
          success(
            "BAN",
            `${target} was banned by <@${message.author.id}>`
          )
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
          success(
            "KICK",
            `${target} was kicked by <@${message.author.id}>`
          )
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
          success(
            "WARN",
            `${target} was warned by <@${message.author.id}>`
          )
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
          success(
            "MUTE",
            `${target} was muted by <@${message.author.id}>`
          )
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
          success(
            "UNMUTE",
            `${target} was unmuted by <@${message.author.id}>`
          )
        ]
      });
    }
  });
};
