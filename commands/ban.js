const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ban",
  async execute(message, args) {
    const t = message.mentions.members.first();
    if (!t) return message.reply("Mention user");
    await t.ban().catch(()=>{});
    message.reply({ embeds:[new EmbedBuilder().setTitle("BANNED").setColor(0x2ECC71).setDescription(t.user.tag)] });
  }
};