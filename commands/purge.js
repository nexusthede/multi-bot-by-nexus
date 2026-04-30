const {
  fail,
  permission,
  success
} = require("../utils/embeds/embedmod");

const { canUse } = require("../utils/perms");

module.exports = {
  name: "purge",
  aliases: ["clear", "clean"],

  async execute(message, args) {
    if (!message.guild || message.author.bot) return;

    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100)
      return message.channel.send({
        embeds: [fail("Provide a number between 1-100")]
      });

    // 🔐 CENTRAL PERMISSION CHECK
    if (!canUse(message.member, "purge"))
      return message.channel.send({
        embeds: [permission("Admin / SrMod Access Required")]
      });

    try {
      await message.channel.bulkDelete(amount, true);
    } catch (err) {
      return message.channel.send({
        embeds: [fail("Failed to delete messages (messages may be too old)")]
      });
    }

    return message.channel.send({
      embeds: [success(`Deleted ${amount} messages`)]
    });
  }
};
