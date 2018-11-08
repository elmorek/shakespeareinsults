// Just to avoid Heroku crap
const express = require('express');
const app = express();

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
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  var swearwords = config.insults;
  for (var i=0; i>swearwords.length; i++) {
    if (message.content.includes(swearwords[i])) {
      message.channel.send(`Scoundrel, rogue, knave! Doth thee kisseth thy mother with such mouth, ${message.author}?`);
    }
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
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    randomAdj = getRandomNumber(0, config.adj.length);
    randomNoun = getRandomNumber(0, config.noun.length);
    let adj = config.adj[randomAdj];
    let noun = config.noun[randomNoun];
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if (message.isMentioned(client.user)) {
      function wait(ms) {
        var start = new Date().getTime();
        var end = start;
        while(end < start + ms) {
          end = new Date().getTime();
        }
      }
      message.channel.send('So... you think that is funny, huh?');
      wait(2000);
      message.channel.send("Like let's make fun of the bot because he doesn't care");
      wait(2000);
      message.channel.send(`Let me tell you something, ${message.author}, thou art ${adj} ${noun}!`);
    } else {
      message.channel.send(`${member.user}, thou art ${adj} ${noun}!`);
    }
  }
  if (command === "help") {
    message.channel.send('use !insult an a mention to generate an insult');
  }
});

client.login(process.env.DISCORD_TOKEN);
