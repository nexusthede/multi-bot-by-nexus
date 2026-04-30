const permissions = {
  // 🚫 HIGH RISK (STRICT)
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

  // ⚖ MODERATION (INCLUDING TRIAL MOD MUTE ACCESS)
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

  // 🟡 MUTE SYSTEM (TRIAL MOD INCLUDED HERE)
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

  // 🟢 WARN (still allowed)
  warn: [
    ...access.owner,
    ...access.admin,
    ...access.srmod,
    ...access.mod,
    ...access.trialmod,
    ...access.helper
  ]
};
