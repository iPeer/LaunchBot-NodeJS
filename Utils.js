module.exports = {
  parseEpochToDate: function(epoch) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var d = new Date(epoch * 1000);
    var date = pad(d.getUTCDate());
    var month = months[d.getUTCMonth()];
    var year = d.getUTCFullYear();

    var day = days[d.getUTCDay()];

    var hours = pad(d.getUTCHours());
    var mins = pad(d.getUTCMinutes());
    var secs = pad(d.getUTCSeconds());

    var outStr = `${day}, ${month} ${date}`;
    if (new Date().getUTCFullYear() != d.getUTCFullYear()) {
      outStr = outStr + " "+d.getUTCFullYear();
    }
    outStr = outStr+`, ${hours}:${mins}:${secs}`;
    if (outStr.endsWith(":00")) {
      outStr = outStr.substr(0, outStr.length - 3);
    }
    return outStr;
  },
  pad: pad,
  getWindowString: function(launch, oldFormat = false, appendUTC = false) {
    if (launch.delayed || launch.monthonlyeta) return "Unknown";

    var open = launch.windowopens_epoch;
    var close = launch.windowcloses_epoch;
    if (close == undefined || open == close) { return "Instantaneous"; }

    var date = new Date(launch.windowopens_epoch * 1000);

    var dateStr1 = pad(date.getHours())+":"+pad(date.getMinutes())+":"+pad(date.getSeconds());
    if (dateStr1.endsWith(":00"))
    dateStr1 = dateStr1.substr(0, dateStr1.length - 3);

    date = new Date(launch.windowcloses_epoch * 1000);

    var dateStr2 = pad(date.getHours())+":"+pad(date.getMinutes())+":"+pad(date.getSeconds());
    if (dateStr2.endsWith(":00"))
    dateStr2 = dateStr2.substr(0, dateStr2.length - 3);
    wString = getCountdownTime(close - open);

    if (wString.endsWith(":00"))
      wString = wString.substr(0, wString.length - 3);

    return dateStr1+"—"+dateStr2+(!oldFormat ? "\n" : "")+(appendUTC ? " UTC " : "")+"("+wString+")";
  },
  getCountdownTime: getCountdownTime,
  getCountdownDay: getCountdownDay,
  ord: ord
}

function pad(n) {
  if (n >= 10) return n;
  else return "0"+n;
}

function getCountdownDay(launch) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var d = new Date(launch.launchtime_epoch * 1000);
  if (launch.holding) { return "HOLDING"; }
  if (launch.monthonlyeta) {
    return "NET "+months[d.getUTCMonth()];
  }
  if (launch.monthonlyeta) {
    return "NET "+months[d.getUTCMonth()];
  }
  else {
    return "NET "+months[d.getUTCMonth()]+" "+ord(d.getUTCDay());
  }
}

function ord(n) {

    if (n == 11 || n == 12 || n == 13) { return n+"th"; }
    var endChar = n.toString().substr(n.toString().length - 1, 1);
    switch (endChar) {
        case "1":
            return n+"st";
        case "2":
            return n+"nd";
        case "3":
            return n+"rd";
    }
    return n+"th";

}

function getCountdownTime(secs) {
  var hours = Math.floor(secs / 3600);
  var minutes = Math.floor((secs % 3600) / 60);
  var seconds = secs % 60;

  var days = Math.floor(hours / 24);
  hours = hours - (days * 24);

  var weeks = Math.floor(days / 7);
  days = days - (weeks * 7);

  //console.log("---> "+weeks+" "+days+" "+hours+" "+minutes+" "+seconds);

  var time = "";
  if (weeks > 0) { time += weeks+" "+(weeks == 1 ? "week" : "weeks")+", "; }
  if (days > 0) { time += days+" "+(days == 1 ? "day" : "days")+", "; }
  if (weeks == 0) { time += pad(hours)+":"+pad(minutes)+":"+pad(seconds); }
  else { time = time.substr(0, time.length - 2); }

  return time;
}
