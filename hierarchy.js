const OWNER_ROLES = [
  "1449945270782525502",
  "1466497373776908353"
];

const ADMIN_ROLES = [
  "1450022204657111155"
];

const MOD_ROLES = [
  "1465960511375151288",
  "1468316755847024730"
];

// =========================
// ROLE CHECK
// =========================
function hasRole(member, list) {
  if (!member?.roles?.cache || !Array.isArray(list)) return false;
  return member.roles.cache.some(role => list.includes(role.id));
}

// =========================
// MAIN CHECK
// =========================
async function canModerate(moderator, target) {
  if (!moderator || !target) {
    return { ok: false, reason: "Invalid user target." };
  }

  // 👑 OWNER = FULL ACCESS (bypass everything)
  if (hasRole(moderator, OWNER_ROLES)) {
    return { ok: true };
  }

  // 🤖 BOT PROTECTION (simple + reliable)
  if (target.user?.bot) {
    return {
      ok: false,
      reason: "You cannot moderate bots."
    };
  }

  // 🚫 OWNER PROTECTION ONLY (don’t over-block staff)
  if (hasRole(target, OWNER_ROLES)) {
    return {
      ok: false,
      reason: "This user is protected."
    };
  }

  // 🛡 ADMIN ACCESS
  if (hasRole(moderator, ADMIN_ROLES)) {
    return { ok: true };
  }

  // 👮 MOD LOGIC (role hierarchy respected)
  if (hasRole(moderator, MOD_ROLES)) {
    if (moderator.roles.highest.position <= target.roles.highest.position) {
      return {
        ok: false,
        reason: "You cannot moderate a user with equal or higher role."
      };
    }

    return { ok: true };
  }

  return {
    ok: false,
    reason: "You do not have permission to use this command."
  };
}

module.exports = {
  canModerate,
  hasRole,
  OWNER_ROLES,
  ADMIN_ROLES,
  MOD_ROLES
};
