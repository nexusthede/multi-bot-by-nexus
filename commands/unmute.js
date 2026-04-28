const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unmute",
  async execute(message, args) {
    const t = message.mentions.members.first();
    if (!t) return message.reply("mention user");
    await t.timeout(null).catch(()=>{});

    message.reply({ embeds:[new EmbedBuilder().setTitle("UNMUTED").setColor(0x2ECC71).setDescription(t.user.tag)] });
  }
};