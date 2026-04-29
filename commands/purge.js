const access = require("../config/access");

const {
  fail,
  permission,
  success
} = require("../utils/embeds/embedmod");

const {
  hasAccess
} = require("../utils/guards");

module.exports = {
  name: "purge",

  async execute(message, args) {
    const amount = parseInt(args[0]);

    // no number
    if (!amount || amount <= 0 || amount > 100)
      return message.reply({
        embeds: [fail("Provide a number between 1 and 100")]
      });

    // admin only
    if (!hasAccess(message.member, access.admin))
      return message.reply({
        embeds: [permission("Administrator")]
      });

    // delete messages
    await message.channel.bulkDelete(amount, true);

    return message.reply({
      embeds: [
        success(`Deleted ${amount} messages`)
      ]
    });
  }
};
