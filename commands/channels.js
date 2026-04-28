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

function getTier(member) {
  if (!member?.roles?.cache) return 0;

  let highest = 0;
  for (const role of member.roles.cache.values()) {
    const tier = ROLE_TIERS[role.id];
    if (tier && tier > highest) highest = tier;
  }
  return highest;
}

// =========================
// COOLDOWN SYSTEM
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
// EMBEDS (CONSISTENT STYLE)
// =========================
function successEmbed(text, title = "SUCCESS") {
  return new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(title)
    .setDescription(text)
    .setTimestamp();
}

function failEmbed(text, title = "FAILED") {
  return new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle(title)
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
// BOT PERMISSION CHECK
// =========================
function botHasPerm(message, perm) {
  return message.guild.members.me.permissions.has(perm);
}

// =========================
// COMMAND HANDLER
// =========================
module.exports = {
  name: "channel",

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const cmdRaw = message.content.slice(1).split(/ +/)[0]?.toLowerCase();

    // =========================
    // ALIASES
    // =========================
    const aliases = {
      l: "lock",
      ul: "unlock",
      h: "hide",
      uh: "unhide",
      c: "clear",
      purge: "clear"
    };

    const cmd = aliases[cmdRaw] || cmdRaw;

    if (checkCooldown(message.author.id, cmd)) return;

    // =========================
    // ADMIN/OWNER ONLY GATE
    // =========================
    const userTier = getTier(message.member);

    if (userTier < TIERS.ADMIN) {
      return message.reply({
        embeds: [
          permissionEmbed("Only Admins and Owners can use channel commands.")
        ]
      });
    }

    // =========================
    // PERMISSIONS PER ACTION
    // =========================
    const perms = {
      lock: PermissionsBitField.Flags.ManageChannels,
      unlock: PermissionsBitField.Flags.ManageChannels,
      hide: PermissionsBitField.Flags.ManageChannels,
      unhide: PermissionsBitField.Flags.ManageChannels,
      clear: PermissionsBitField.Flags.ManageMessages
    };

    const requiredPerm = perms[cmd];

    if (requiredPerm && !message.member.permissions.has(requiredPerm)) {
      return message.reply({
        embeds: [permissionEmbed("Missing required Discord permissions.")]
      });
    }

    if (requiredPerm && !botHasPerm(message, requiredPerm)) {
      return message.reply({
        embeds: [failEmbed("Bot is missing required permissions.")]
      });
    }

    // =========================
    // LOCK
    // =========================
    if (cmd === "lock") {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      return message.reply({
        embeds: [successEmbed("Channel has been locked.", "LOCK")]
      });
    }

    // =========================
    // UNLOCK
    // =========================
    if (cmd === "unlock") {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true
      });

      return message.reply({
        embeds: [successEmbed("Channel has been unlocked.", "UNLOCK")]
      });
    }

    // =========================
    // HIDE
    // =========================
    if (cmd === "hide") {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: false
      });

      return message.reply({
        embeds: [successEmbed("Channel is now hidden.", "HIDE")]
      });
    }

    // =========================
    // UNHIDE
    // =========================
    if (cmd === "unhide") {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: true
      });

      return message.reply({
        embeds: [successEmbed("Channel is now visible.", "UNHIDE")]
      });
    }

    // =========================
    // CLEAR / PURGE
    // =========================
    if (cmd === "clear") {
      const amount = parseInt(args[1]);

      if (!amount || amount < 1 || amount > 100) {
        return message.reply({
          embeds: [failEmbed("Enter a number between 1 and 100.")]
        });
      }

      await message.channel.bulkDelete(amount, true);

      return message.reply({
        embeds: [successEmbed(`${amount} messages deleted.`, "CLEAR")]
      });
    }
  }
};
