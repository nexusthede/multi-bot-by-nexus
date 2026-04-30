const access = require("./access");

module.exports = {
  // 🚫 HIGH RISK
  ban: [
    ...access.owner,
    ...access.admin,
    ...access.srmod
  ],

  jail: [
    ...access.owner,
    ...access.admin,
    ...access.srmod
  ],

  unjail: [
    ...access.owner,
    ...access.admin,
    ...access.srmod
  ],

  // ⚖ MODERATION
  kick: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod
  ],

  purge: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod
  ],

  warn: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod,
    ...access.trialmod,
    ...access.helper
  ],

  mute: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod,
    ...access.trialmod
  ],

  unmute: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod,
    ...access.trialmod
  ],

  // 🛠 ROLE
  role: [
    ...access.owner,
    ...access.admin,
    ...access.srmod
  ],

  removerole: [
    ...access.owner,
    ...access.admin,
    ...access.srmod
  ],

  // 🧱 CHANNEL
  lock: [
    ...access.owner,
    ...access.admin
  ],

  unlock: [
    ...access.owner,
    ...access.admin
  ],

  hide: [
    ...access.owner,
    ...access.admin
  ],

  unhide: [
    ...access.owner,
    ...access.admin
  ],

  // 🧹 ALIASES
  clear: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod
  ],

  clean: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod
  ]
};
