const { EmbedBuilder, PermissionsBitField } = require("discord.js");

// =========================
// EMBEDS
// =========================
const failEmbed = (text) =>
  new EmbedBuilder()
    .setColor(0xE74C3C)
    .setTitle("FAILED")
    .setDescription(text)
    .setFooter({
      text: `Today at ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`
    });

const permissionEmbed = (perm) =>
  new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle("PERMISSION")
    .setDescription(
      `> You are missing required permission\n> \`${perm}\``
    )
    .setFooter({
      text: `Today at ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`
    });

// =========================
// HIERARCHY CHECK
// =========================
function canModerate(mod, target) {
  if (mod.id === target.id) {
    return { ok: false, reason: "You cannot use this command on yourself" };
  }

  if (target.roles.highest.position >= mod.roles.highest.position) {
    return {
      ok: false,
      reason: "You cannot moderate someone with equal or higher role"
    };
  }

  return { ok: true };
}

// =========================
// COMMAND
// =========================
module.exports = {
  name: "ban",

  async execute(message, args) {
    const target = message.mentions.members.first();

    // ❌ No user
    if (!target) {
      return message.reply({
        embeds: [failEmbed("Mention a user")]
      });
    }

    // ❌ Bot permission
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply({
        embeds: [permissionEmbed("Bot lacks Ban Members permission")]
      });
    }

    // ❌ User permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply({
        embeds: [permissionEmbed("Ban Members")]
      });
    }

    // ❌ Hierarchy check
    const check = canModerate(message.member, target);
    if (!check.ok) {
      return message.reply({
        embeds: [failEmbed(check.reason)]
      });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.ban({ reason });

      // 🔴 BAN EMBED
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle("BAN")
        .setDescription(
          `${target} was banned by ${message.author}\nToday at ${now}`
        );

      return message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return message.reply({
        embeds: [failEmbed("Failed to ban user")]
      });
    }
  }
};
