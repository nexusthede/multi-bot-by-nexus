require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const express = require("express");

// =========================
// EXPRESS (RENDER KEEP ALIVE + FIXED PORT)
// =========================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// =========================
// MONGO CONNECT
// =========================
const connectMongo = require("./database/mongo");
connectMongo();

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
// LOAD COMMANDS (SAFE + DEBUG)
// =========================
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

console.log("📦 Loading commands...");

for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);

    if (!command?.name || !command?.execute) {
      console.log(`❌ Invalid command file: ${file}`);
      continue;
    }

    client.commands.set(command.name.toLowerCase(), command);
    console.log(`✅ Loaded: ${command.name}`);
  } catch (err) {
    console.error(`❌ Error loading ${file}:`, err);
  }
}

console.log(`📊 Total commands: ${client.commands.size}`);

// =========================
// WELCOME SYSTEM
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
// COOLDOWN
// =========================
const cooldown = new Map();

// =========================
// MESSAGE HANDLER (FIXED + ALIASES)
// =========================
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(".")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  console.log("➡ Received command:", commandName);

  // 🔥 FIX: ALIAS SUPPORT ADDED HERE
  const command =
    client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases?.includes(commandName));

  if (!command) {
    console.log("❌ Command not found:", commandName);
    return;
  }

  const key = `${message.author.id}-${commandName}`;
  const now = Date.now();

  if (cooldown.get(key) > now) return;

  cooldown.set(key, now + 1500);
  setTimeout(() => cooldown.delete(key), 1500);

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(`❌ Command error (${commandName}):`, err);
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
// SAFETY
// =========================
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
