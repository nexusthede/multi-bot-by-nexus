const permissions = require("../config/dataperms"); // 👈 UPDATED

function canUse(member, command) {
  if (!member?.roles?.cache) return false;

  const allowedRoles = permissions[command];

  if (!allowedRoles) {
    console.log(`❌ Missing permission key: ${command}`);
    return false;
  }

  return member.roles.cache.some(role =>
    allowedRoles.includes(role.id)
  );
}

module.exports = { canUse };
