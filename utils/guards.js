const access = require("../config/access");

// 🛡 check if target is protected
function isProtected(target) {
  return target.roles.cache.some(role =>
    access.protected.includes(role.id)
  );
}

// ⚖ check if user has staff access (NOW INCLUDES OWNER + COOWNER BYPASS)
function hasAccess(member, roleList) {
  // 👑 OWNER / CO-OWNER bypass
  if (access.owner.includes(member.id)) return true;
  if (access.coowner.includes(member.id)) return true;

  // 🛠 ROLE CHECK
  return member.roles.cache.some(role =>
    roleList.includes(role.id)
  );
}

// ⚠ bot + user role safety (hierarchy check)
function checkHierarchy(message, target) {
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
