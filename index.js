require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const express = require("express");

// =========================
// EXPRESS
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
// MONGO
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
// LOAD COMMANDS
// =========================
const commandPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandPath)
  .filter(f => f.endsWith(".js"));

console.log("📦 Loading commands...");

for (const file of commandFiles) {
  try {
    const command = require(path.join(commandPath, file));

    if (!command?.name || !command?.execute) {
      console.log(`❌ Invalid command: ${file}`);
      continue;
    }

    client.commands.set(command.name.toLowerCase(), command);
    console.log(`✅ Loaded: ${command.name}`);

  } catch (err) {
    console.error(`❌ Error loading ${file}:`, err);
  }
}

console.log(`📊 Total commands: ${client.commands.size}`);
console.log(`📌 Commands:`, [...client.commands.keys()]);

// =========================
// WELCOME SYSTEM
// =========================
const setupWelcome = require("./events/welcome");
const WELCOME_CHANNEL_ID = "1478295508593283123";

setupWelcome(client, WELCOME_CHANNEL_ID);

// =========================
// READY
// =========================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =========================
// COOLDOWN
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

  console.log("➡ Command:", commandName);

  // MAIN COMMAND
  let command = client.commands.get(commandName);

  // ALIASES
  if (!command) {
    command = client.commands.find(cmd =>
      Array.isArray(cmd.aliases) &&
      cmd.aliases.map(a => a.toLowerCase()).includes(commandName)
    );
  }

  if (!command) {
    console.log("❌ Command not found:", commandName);
    return;
  }

  // COOLDOWN
  const key = `${message.author.id}-${commandName}`;
  const now = Date.now();

  if (cooldown.get(key) > now) return;

  cooldown.set(key, now + 1500);
  setTimeout(() => cooldown.delete(key), 1500);

  // EXECUTION
  try {
    await command.execute(message, args, client);

  } catch (err) {
    console.error(`Command error (${commandName}):`, err);

    message.reply({
      embeds: [
        {
          color: 0xE74C3C,
          description:
            `**COMMAND FAILED**\n` +
            `• Command\n> ${commandName}\n` +
            `• Status\n> Execution error`,
          timestamp: new Date()
        }
      ]
    }).catch(() => {});
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
