const Discord = require('discord.js');
const Utils = require('../Utils.js');
module.exports = {
  help: "<prefix>nextlaunch [search query] -- Returns information on the next rocket launch. If [search query] is provided, it will show the first launch matching that query (if any)",
  run: (LaunchBot, prefix, command, args, messageObj) => {
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
          var tagsString = "";
          var tags = launch.tags;
          for (x = 0; x <= tags.length; x++) {
            tagsString = tagsString+(tagsString.length > 0 ? "**, **" : "")+tags.shift().text;
          }
          /*for (x = 0; x < launch.tags.length; x++) {
          console.log("Tag: "+tag);
          tagsString = tagsString + (tagsString.length > 0 ? "," : "")+launch.tags.shift().text;
        }*/
        embed.addField("Tags", "**"+tagsString+"**");
      }
      var cdSecs = Math.floor((new Date().getTime() - launch.launchtime_epoch * 1000) / 1000);
      cdSecs = Math.abs(cdSecs);
      embed.addField("Launch provider", provider, true)
      .addField("Launching from", location, true)
      .addBlankField();
      if (launch.holding || launch.delayed || launch.monthonlyeta) {
        embed.addField("T0", Utils.getCountdownDay(launch), true);
      }
      else {
        embed.addField("T0", Utils.parseEpochToDate(launchtimeepoch)+"\n(L-"+Utils.getCountdownTime(cdSecs)+")", true)
        .addField("Window", Utils.getWindowString(launch), true);
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



      messageObj.channel.send({embed});
    });
  });
  request.on('error', function (e) {
    messageObj.channel.send("Couldn't get launch data at this time. Forward this to iPeer if it persists for more than 30 minutes: "+e.message);
  });
  request.end();
},
aliases: ["nl", "nextlaunch", "upcominglaunch", "ul"]
}
