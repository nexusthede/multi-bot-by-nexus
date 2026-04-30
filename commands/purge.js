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
      return message.channel.send({
        embeds: [fail("Provide a number between 1-100")]
      });

    // 🔒 ONLY OWNER / ADMIN / SRMOD
    if (
      !hasAccess(message.member, access.owner) &&
      !hasAccess(message.member, access.admin) &&
      !hasAccess(message.member, access.srmod)
    )
      return message.channel.send({
        embeds: [permission("Admin / SrMod Access Required")]
      });

    await message.channel.bulkDelete(amount, true);

    return message.channel.send({
      embeds: [success(`Deleted ${amount} messages`)]
    });
  }
};
