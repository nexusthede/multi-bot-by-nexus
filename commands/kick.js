const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "kick",
  async execute(message, args) {
    const t = message.mentions.members.first();
    if (!t) return message.reply("Mention user");
    await t.kick().catch(()=>{});
    message.reply({ embeds:[new EmbedBuilder().setTitle("KICKED").setColor(0x2ECC71).setDescription(t.user.tag)] });
  }
};