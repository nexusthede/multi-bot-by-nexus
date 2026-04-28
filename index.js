require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const express = require("express");

// =========================
// MONGO CONNECT
// =========================
const connectMongo = require("./database/mongo");
connectMongo();

// =========================
// EXPRESS (RENDER KEEP ALIVE)
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
const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (command?.name && command?.execute) {
    client.commands.set(command.name, command);
    console.log(`Loaded: ${command.name}`);
  } else {
    console.log(`Skipped invalid command: ${file}`);
  }
}

// =========================
// LOAD EVENTS (WELCOME SYSTEM)
// =========================
const setupWelcome = require("./events/welcome");

const WELCOME_CHANNEL_ID = "1478295508593283123";

setupWelcome(client, WELCOME_CHANNEL_ID);

// =========================
// READY EVENT
// =========================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =========================
// COOLDOWN SYSTEM
// =========================
const cooldown = new Map();

// =========================
// MESSAGE HANDLER
// =========================
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(".")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  const key = `${message.author.id}-${commandName}`;
  const now = Date.now();

  if (cooldown.get(key) > now) return;

  cooldown.set(key, now + 1500);
  setTimeout(() => cooldown.delete(key), 1500);

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(`Command error (${commandName}):`, err);
    message.reply("❌ Something went wrong.");
  }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Login failed:", err);
});

// =========================
// SAFETY NET
// =========================
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
