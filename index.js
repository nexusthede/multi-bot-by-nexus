require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const express = require('express');
const connectMongo = require('./database/mongo');

const PREFIX = ",";

// Express server (required for Render)
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web server ready');
});

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Ready event
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  await connectMongo();
});

// Prefix command handler
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error running command');
  }
});

client.login(process.env.TOKEN);

// Error safety (important for hosting)
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
