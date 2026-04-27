module.exports = (client, WELCOME_CHANNEL_ID) => {

  client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    channel.send(`👋 Welcome ${member.user} to the server!`);
  });

};
