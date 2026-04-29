const access = require("../config/access");

const {
  fail,
  permission,
  success
} = require("../utils/embeds/embedmod");

const { hasAccess } = require("../utils/guards");

module.exports = {
  name: "purge",
  aliases: ["clear", "clean"],

  async execute(message, args) {
    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100)
      return message.reply({
        embeds: [fail("> Provide a number between 1-100")]
      });

    if (!hasAccess(message.member, access.admin))
      return message.reply({
        embeds: [permission("> Administrator")]
      });

    await message.channel.bulkDelete(amount, true);

    return message.reply({
      embeds: [success(`> Deleted ${amount} messages`)]
    });
  }
};
