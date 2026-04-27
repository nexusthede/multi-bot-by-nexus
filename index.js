require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const express = require('express');

// =========================
// WEB SERVER (RENDER KEEP-ALIVE)
// =========================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// =========================
// LOAD EVENTS
// =========================
const setupWelcome = require('./events/welcome');

// =========================
// CONFIG
// =========================
const PREFIX = ".";

const WELCOME_CHANNEL_ID = '1478295508593283123';

// =========================
// ENV SAFETY
// =========================
if (!process.env.TOKEN) {
  console.log("❌ Missing TOKEN in environment variables");
  process.exit(1);
}

// =========================
// CLIENT
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// =========================
// LOAD COMMANDS
// =========================
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// =========================
// WELCOME SYSTEM
// =========================
setupWelcome(client, WELCOME_CHANNEL_ID);

// =========================
// READY EVENT
// =========================
client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =========================
// MESSAGE HANDLER
// =========================
client.on('messageCreate', message => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);

  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ Error running command");
  }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Login failed:", err);
});

// =========================
// SAFETY CRASH HANDLERS
// =========================
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
