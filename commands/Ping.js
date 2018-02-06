const Discord = require('discord.js');
const Utils = require('../Utils.js');
module.exports = {
  help: "<prefix>ping - PONG!",
  run: (LaunchBot, prefix, command, switches, args, messageObj) => {
    messageObj.reply("I'm here!");
},
aliases: ["ping"]
}
