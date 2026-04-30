const access = require("../config/access");
const { hasAccess } = require("./guards");

/**
 * Helper: build staff list quickly
 */
function staffList(extra = []) {
  return [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod,
    ...access.trialmod,
    ...access.helper,
    ...extra
  ];
}

/**
 * BAN PERMISSION
 * Owner + Admin + SrMod only (tighter control)
 */
function canBan(member) {
  return hasAccess(member, [
    ...access.owner,
    ...access.admin,
    ...access.srmod
  ]);
}

/**
 * KICK PERMISSION
 * Slightly wider than ban
 */
function canKick(member) {
  return hasAccess(member, staffList([
    ...access.admin,
    ...access.srmod,
    ...access.mod
  ]));
}

/**
 * WARN PERMISSION
 * All staff can warn
 */
function canWarn(member) {
  return hasAccess(member, staffList());
}

/**
 * PURGE / CLEAR PERMISSION
 * Mods and above
 */
function canPurge(member) {
  return hasAccess(member, staffList([
    ...access.admin,
    ...access.srmod,
    ...access.mod
  ]));
}

module.exports = {
  canBan,
  canKick,
  canWarn,
  canPurge
};
