// Just to avoid Heroku crap
const express = require('express');
const app = express();
const fs = require('fs');
const { pgClient } = require('pg');
const dbClient = new pgClient({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  const result = 'App is running';
  response.send(result);
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});
// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");

// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`I am sick when I do look on thee`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`I am sick when I do look on thee`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`I am sick when I do look on thee`);
});


client.on("message", async message => {

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  var swearwords = config.insults;
  var comebacks = config.comebacks;
  for (var i=0; i<swearwords.length; i++) {
    if (message.content.toLowerCase().includes(swearwords[i])) {
      message.channel.send(`${message.author}${comebacks[getRandomNumber(0, comebacks.length)]}`);
      break;
    }
  }

  if(message.content.startsWith('addfeature!')) {
    dbClient.connect();
    const query = 'INSERT INTO features(description, status) VALUES($1, $2)';
    const values = [message.content, 'pending'];
    
    dbClient.query(query, values, (err, res)) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(res.rows[0]);
      }
    }
    dbClient.end();
  }

  if(message.content.startsWith('listfeatures!')) {
    let listoffeatures = `List of features:\n\n`;
    for (var i = 0; i< features.features.length; i++) {
      listoffeatures+`**id: ** ${features.features[i].id}\n**description:** ${features.features[i].description}\n**status:** ${features.features[i].status}\n\n`;
    }
    console.log(listoffeatures);
    message.channel.send(listoffeatures);
  }

  if(message.content.endsWith("Shakespeare!") == false && message.content.endsWith("Shakespeare?") == false ) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  let args = message.content.trim().split(/ +/g);
  console.log(args);
  args = args.reverse();
  console.log(args);
  const command = args.shift().toLowerCase();
  console.log(command);
  
  if(command === "shakespeare!" || "shakespeare?") {
    randomAdj = getRandomNumber(0, config.adj.length);
    randomNoun = getRandomNumber(0, config.noun.length);
    let adj = config.adj[randomAdj];
    let noun = config.noun[randomNoun];
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if (message.isMentioned(client.user)) {
      message.channel.send(`${message.author}, thou art ${adj} ${noun}!`);
    } else {
      message.channel.send(`${member.user}, thou art ${adj} ${noun}!`);
    }
  }
  if (command === "help") {
    message.channel.send('use !insult an a mention to generate an insult');
  }
});

client.login(process.env.DISCORD_TOKEN);
