const { purgeEmbed, failEmbed, permissionEmbed } = require("../utils/embeds");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "purge",
  aliases: ["clear", "prune"],

  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (!amount)
      return message.reply({ embeds: [failEmbed("Provide amount")] });

    await message.channel.bulkDelete(amount, true);

    return message.reply({
      embeds: [purgeEmbed(amount, message.author, message.channel)]
    });
  }
};
