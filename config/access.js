module.exports = {
  // 👑 Owners (full control)
  owner: [
    "OWNER_ROLE_ID"
  ],

  // 🛠 Admins (high-level moderation)
  admin: [
    "ADMIN_ROLE_ID_1",
    "ADMIN_ROLE_ID_2"
  ],

  // ⚖ Moderators (basic moderation)
  mod: [
    "MOD_ROLE_ID_1",
    "MOD_ROLE_ID_2"
  ],

  // 🧰 Helpers (optional lower staff)
  helper: [
    "HELPER_ROLE_ID_1"
  ],

  // 🛡 Protected roles (cannot be banned/kicked/muted)
  protected: [
    "OWNER_ROLE_ID",
    "ADMIN_ROLE_ID_1"
  ]
};
