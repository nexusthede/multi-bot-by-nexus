const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "mute",
  async execute(message, args) {
    const t = message.mentions.members.first();
    const time = args[1];
    if (!t || !time) return message.reply("user + time");

    const ms = time.endsWith("m") ? parseInt(time)*60000 : parseInt(time)*3600000;
    await t.timeout(ms).catch(()=>{});

    message.reply({ embeds:[new EmbedBuilder().setTitle("MUTED").setColor(0x2ECC71).setDescription(t.user.tag)] });
  }
};