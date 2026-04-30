const access = require("../config/access");

// 🛡 check if target is protected
function isProtected(target) {
  if (!target?.roles) return false;

  return target.roles.cache.some(role =>
    access.protected.includes(role.id)
  );
}

// ⚖ check staff access (ROLE-BASED ONLY)
function hasAccess(member, roleList = []) {
  if (!member) return false;

  // 👑 OWNER bypass (role-based)
  const isOwner = member.roles.cache.some(role =>
    access.owner.includes(role.id)
  );

  if (isOwner) return true;

  // 🧠 CO-OWNER bypass
  const isCoOwner = member.roles.cache.some(role =>
    access.coowner.includes(role.id)
  );

  if (isCoOwner) return true;

  // 🛠 safe role check
  if (!Array.isArray(roleList)) return false;

  return member.roles.cache.some(role =>
    roleList.includes(role.id)
  );
}

// ⚠ hierarchy safety check
function checkHierarchy(message, target) {
  if (!message?.guild || !message?.member || !target) return "USER";

  const bot = message.guild.members.me;

  if (target.roles.highest.position >= message.member.roles.highest.position)
    return "USER";

  if (target.roles.highest.position >= bot.roles.highest.position)
    return "BOT";

  return "OK";
}

module.exports = {
  isProtected,
  hasAccess,
  checkHierarchy
};
