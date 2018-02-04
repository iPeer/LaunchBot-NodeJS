const fs = require('fs');
const Discord = require('discord.js');

//const CommandManager = require('./CommandManager.js');

LaunchBot = {
  config: require('./config/config.json'),
  DiscordClient: new Discord.Client(),
  IsUserAdmin: function (UserID) {
    return LaunchBot.config.botOwnerAccountIDs.indexOf(UserID) > -1;
  }
}

module.exports = LaunchBot;

global.commands = {};

LaunchBot.LoadCommands = () => {
  var cList = fs.readdirSync('./commands/');
  commands = {};
  for (x = 0; x < cList.length; x++) {
    var cmd = cList[x];
    if (cmd.match(/\.js$/)) {
      delete require.cache[require.resolve(`./commands/${cmd}`)];
      commands[cmd.slice(0, -3)] = require(`./commands/${cmd}`);
      // TODO: Make it dump this to the debug channel
    }
  }
  //LaunchBot.commands["NextLaunch"] = require('./commands/NextLaunch.js');
}

LaunchBot.FireMatchingCommands = (commandAlias, commandPrefix, commandArgs, LaunchBot, messageData)  => {
  commands["NextLaunch"] = require('./commands/NextLaunch.js');
  for (var key in commands) {
    if (commands[key].aliases.indexOf(commandAlias) > -1) {
      commands[key].run(LaunchBot, commandPrefix, commandAlias, commandArgs, messageData)
    }
  }
}

LaunchBot.DiscordClient.on('ready', () => {
  console.log('I am ready!');
  LaunchBot.commands = {};
  LaunchBot.LoadCommands();
});

LaunchBot.DiscordClient.on('message', message => {
  if (LaunchBot.DiscordClient.user.id == message.author.id) { return; } // Don't fire anything if the user sending the message is the bot
  //console.log(`${message.author.username}: ${message.content}`);
  var cmdPrefix = message.content.charAt(0);
  if (LaunchBot.config.commandTriggerCharacters.includes(cmdPrefix)) {
    var commandData = message.content.slice(1).split(" ");
    var commandName = commandData.shift();
    if (new Array("reloadcommands", "rla").indexOf(commandName) > -1 && LaunchBot.IsUserAdmin(message.author.id)) {
      LaunchBot.LoadCommands();
      return;
    }
    if (new Array("qqq", "quit", "terminate", "die").indexOf(commandName) > -1 && LaunchBot.IsUserAdmin(message.author.id)) {
      LaunchBot.DiscordClient.destroy();
      process.exit();
    }
    LaunchBot.FireMatchingCommands(commandName, cmdPrefix, commandData, this, message);
  }
});

LaunchBot.DiscordClient.login(LaunchBot.config.botAPIToken);
