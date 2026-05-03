const permissions = require("../config/dataperms");

function canUse(member, command) {
  if (!member?.roles?.cache) return false;

  const cmd = String(command || "").toLowerCase().trim();

  const allowedRoles = permissions[cmd];

  if (!allowedRoles) return false;

  return member.roles.cache.some(role =>
    allowedRoles.includes(role.id)
  );
}

module.exports = { canUse };
