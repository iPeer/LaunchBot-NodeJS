const Discord = require('discord.js');
const Utils = require('../Utils.js');
module.exports = {
  help: "<prefix>nextlaunch [search query] -- Returns information on the next rocket launch. If [search query] is provided, it will show the first launch matching that query (if any)",
  run: (LaunchBot, prefix, command, switches, args, messageObj) => {
    //if (!messageObj.channel.permissionsOf(LaunchBot.DiscordClient.user).hasPermission("embedLinks")) {
    /*if (!messageObj.channel.guild.channels.get(messageObj.channel.id).permissionsFor(messageObj.channel.guild.me).has("EMBED_LINKS")) { // if it looks stupid but it works, it isn't stupid.
      messageObj.reply("the permission for embedding links is not enabled on this channel for the bot, either enable it for the bot or resend the command as `"+prefix+command+" -t [search arguments]` instead.");
      return;
    }*/
    var http = require('https');

    var options = {
      host: 'ipeer.auron.co.uk',
      path: '/launchschedule/api/1/launches?limit=1&noschema&omitapidata&search='+encodeURIComponent(args.join(" ")),
      port: 443
    }
    var request = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        var json = JSON.parse(data);
        if (json.launches == undefined || json.launches.length == 0) {
          //var userMention = messageObj.author.mention();
          messageObj.reply(` unfortunately no results were found for '${args.join(" ")}' :(`);
          return;
        }
        var launch = json.launches.shift(); // sneaky

        var rocket = launch.vehicle;
        var payload = launch.payload;
        var provider = launch.provider;
        var location = launch.location;

        var launchtimeepoch = launch.launchtime_epoch;
        var windowopens_epoch = launch.windowopens_epoch;
        var windowcloses_epoch = launch.windowcloses_epoch;
        var cdDay = Utils.getCountdownDay(launch);

        var cdSecs = Math.floor((new Date().getTime() - launch.launchtime_epoch * 1000) / 1000);
        cdSecs = Math.abs(cdSecs);
        var cdSecsS = "L-"+Utils.getCountdownTime(cdSecs);
        var t0Time = Utils.parseEpochToDate(launchtimeepoch);

        var lWindow = Utils.getWindowString(launch);

        if (launch.hasTags) {
          var tagsString = "";
          var tags = launch.tags;
          var tl = tags.length;
          for (x = 0; x < tl; x++) {
            tagsString = tagsString+(tagsString.length > 0 ? "** | **" : "")+tags.shift().text;
          }
        }
        if ((switches != undefined && switches.indexOf("t") > -1) || !messageObj.channel.guild.channels.get(messageObj.channel.id).permissionsFor(messageObj.channel.guild.me).has("EMBED_LINKS")) {
          lWindow = Utils.getWindowString(launch, true, true);
          var outStr = rocket+"/"+payload+" — "+t0Time+" UTC ("+cdSecsS+")";
          if (launch.hasTags) { outStr = outStr+"\nTags: **"+tagsString+"**"; }
          outStr = outStr+"\nWindow: "+lWindow;
          outStr = outStr+"\t\tFrom "+location;
          messageObj.channel.send(outStr);
        }
        else {
          var embed = new Discord.RichEmbed()
          .setTimestamp()
          .setFooter("All times UTC. Missing or outdated info? Let @iPeer know")
          .setTitle(args.length > 0 ? `Launch search: '${args.join(" ")}'` : "Upcoming Rocket Launch")
          .setURL("https://ipeer.auron.co.uk/launchschedule/")
          .setColor(launch.holding ? "#FFD433" : launch.delayed ? "#FFA600" : launch.monthonlyeta ? "#FF0000" : "#6D9FFE")
          .setDescription("Information on the next upcoming rocket launch."+(args.length > 0 ? ` Showing first result for '${args.join(" ")}'` : ""))
          .addField("Rocket", rocket, true)
          .addField("Payload", payload, true);
          if (launch.hasTags) {
            /*for (x = 0; x < launch.tags.length; x++) {
            console.log("Tag: "+tag);
            tagsString = tagsString + (tagsString.length > 0 ? "," : "")+launch.tags.shift().text;
          }*/
          embed.addField("Tags", "**"+tagsString+"**");
        }
        embed.addField("Launch provider", provider, true)
        .addField("Launching from", location, true)
        .addBlankField();
        if (launch.holding || launch.delayed || launch.monthonlyeta) {
          embed.addField("T0", cdDay, true);
        }
        else {
          embed.addField("T0", t0Time+"\n("+cdSecsS+")", true)
          .addField("Window", lWindow, true);
        }

        if (launch.hasStream || launch.hasPressKit) {
          embed.addBlankField();
          if (launch.hasStream) {
            var urlStr = "";
            var strams = launch.streamURLs;
            for (x = 0; x <= strams.length; x++) {
              urlStr = urlStr+(urlStr.length > 0 ? "\n" : "")+strams.shift();
            }
            embed.addField("Streams", urlStr, true);
          }
          if (launch.hasPressKit) {
            embed.addField("Press kit", launch.pressKitURL, true);
          }
        }

        if (launch.id == 134) {
          embed.setImage("https://i.imgur.com/2a4TjW9.gif");
        }

        messageObj.channel.send({embed});
        messageObj.channel.send("Message blank? Make sure you have Image/Link previews enabled in your settings.\nAlternatively, resend the command as: `"+prefix+command+" -t"+(args.length > 0 ? " "+args.join(" ") : "")+"`");
      }
    });
  });
  request.on('error', function (e) {
    messageObj.channel.send("Couldn't get launch data at this time. Forward this to iPeer if it persists for more than 30 minutes: "+e.message);
  });
  request.end();
},
aliases: ["nl", "nextlaunch", "upcominglaunch", "ul"]
}
