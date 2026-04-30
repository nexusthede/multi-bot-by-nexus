const access = require("../config/access");

// 🛡 check if target is protected
function isProtected(target) {
  if (!target?.roles?.cache) return false;

  return target.roles.cache.some(role =>
    access.protected.includes(role.id)
  );
}

// ⚖ check staff access (role-based)
function hasAccess(member, roleList = []) {
  if (!member?.roles?.cache) return false;
  if (!Array.isArray(roleList)) return false;

  // 👑 OWNER bypass
  const isOwner = member.roles.cache.some(role =>
    access.owner.includes(role.id)
  );
  if (isOwner) return true;

  // 🧠 CO-OWNER bypass
  const isCoOwner = member.roles.cache.some(role =>
    access.coowner.includes(role.id)
  );
  if (isCoOwner) return true;

  // 🛠 role check
  return member.roles.cache.some(role =>
    roleList.includes(role.id)
  );
}

// ⚠ hierarchy safety
function checkHierarchy(message, target) {
  if (!message?.guild || !message?.member || !target) return "USER";

  const bot = message.guild.members.me;

  const targetRole = target.roles?.highest?.position ?? 0;
  const userRole = message.member.roles?.highest?.position ?? 0;
  const botRole = bot.roles?.highest?.position ?? 0;

  if (targetRole >= userRole) return "USER";
  if (targetRole >= botRole) return "BOT";

  return "OK";
}

module.exports = {
  isProtected,
  hasAccess,
  checkHierarchy
};
