// Just to avoid Heroku crap
const express = require('express');
const app = express();
const { Pool, Client } = require('pg');

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
const bot = new Discord.Client();

// Load the insults
const insults = require("./insults.json");

//Load the private info such as DB URL and Bot Token
const private = require("./private.json");

bot.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  bot.user.setActivity(`I am sick when I do look on thee`);
});

bot.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  bot.user.setActivity(`I am sick when I do look on thee`);
});

bot.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  bot.user.setActivity(`I am sick when I do look on thee`);
});


bot.on("message", async message => {

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  //var swearwords = insults.insults;
  //var comebacks = insults.comebacks;
  //for (var i=0; i<swearwords.length; i++) {
    //if (message.content.toLowerCase().includes(swearwords[i])) {
      //message.channel.send(`${message.author}${comebacks[getRandomNumber(0, comebacks.length)]}`);
      //break;
    //}
  //}

  if(message.content.startsWith('addfeature!')) {
    const client = new Client({
      connectionString: private.DATABASE_URL,
      ssl: true
    });

    const text = 'INSERT INTO features(description, status) VALUES($1, $2);';
    const values = [message.content.slice(11), 'pending'];
    await client.connect();
    client.query(text, values, (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(res);
      }
      client.end();
    });
  }

  if(message.content.startsWith('listfeatures!')) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
    let listoffeatures = `List of features:\n\n`;
    await client.connect();
    client.query('SELECT * FROM features;', (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        for (var i = 0; i<res.rows.length;i++) {
          listoffeatures+=`**ID:** ${res.rows[i].id}\n**Description:** ${res.rows[i].description}\n**Status:** ${res.rows[i].status}\n\n`;
        }
      }
      client.end();
      message.channel.send(listoffeatures);
    });
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
    randomAdj = getRandomNumber(0, insults.adj.length);
    randomNoun = getRandomNumber(0, insults.noun.length);
    let adj = insults.adj[randomAdj];
    let noun = insults.noun[randomNoun];
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if (message.isMentioned(bot.user)) {
      message.channel.send(`${message.author}, thou art ${adj} ${noun}!`);
    } else {
      message.channel.send(`${member.user}, thou art ${adj} ${noun}!`);
    }
  }
  if (command === "help") {
    message.channel.send('use !insult an a mention to generate an insult');
  }
});

bot.login(private.DISCORD_TOKEN);
