const access = require("../config/access");

// 🛡 check if target is protected
function isProtected(target) {
  if (!target || !target.roles) return false;

  return target.roles.cache.some(role =>
    access.protected.includes(role.id)
  );
}

// ⚖ check staff access (OWNER + COOWNER bypass)
function hasAccess(member, roleList = []) {
  if (!member) return false;

  if (access.owner.includes(member.id)) return true;
  if (access.coowner.includes(member.id)) return true;

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
