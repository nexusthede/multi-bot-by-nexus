require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

// load welcome event
const setupWelcome = require('./events/welcome');

// prefix
const PREFIX = ".";

// welcome channel ID
const WELCOME_CHANNEL_ID = '1478295508593283123';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// start welcome system
setupWelcome(client, WELCOME_CHANNEL_ID);

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// prefix handler
client.on('messageCreate', message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

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

// safety
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
