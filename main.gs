var black_list = ['TeenieWeenie'];
var latest, lastDate;

function send(payload) {
  if (payload) {
    var data = {
      "method": "post",
      "payload": payload,
      "muteHttpExceptions": true
    }
    response = UrlFetchApp.fetch("https://api.telegram.org/bot<bot-token>/", data);
    Logger.log(response.getContentText());
  }
}

function getItems() {
  var feed = UrlFetchApp.fetch('https://weiboredeemrss.herokuapp.com/weibo/user/6498105282').getContentText();
  var doc = XmlService.parse(feed);
  var root = doc.getRootElement();
  var channel = root.getChild('channel');
  var items = channel.getChildren('item');
  return items;
}

function textProcess(item) {
  var date_string = item.getChildText('pubDate');
  var date = new Date(date_string);
  if (lastDate && date <= lastDate) return null;
  else if (date > latest) {
    PropertiesService.getScriptProperties().setProperty('lastDate', date_string);
    latest = date;
  }
  var description = item.getChildText('description');
  var forward = description.indexOf('<blockquote');
  if (forward != -1) description = description.slice(0, forward);
  var msg = "";
  var codereg = new RegExp("(?<![a-zA-Z0-9])[a-zA-Z0-9]{12}(?![a-zA-Z0-9])", "g");
  var res = codereg.exec(description);
  while (res) {
    if (black_list.indexOf(res) == -1) msg += res[0] + '\n';
    res = codereg.exec(description);
  }
  if (description.indexOf("兑换码") != -1) {
    var bracketsreg = new RegExp("(?<=\【)[^】]*(?=\】)", "g");
    res = bracketsreg.exec(description);
    while (res) {
      if (res == "评论") {
        res = bracketsreg.exec(description);
        continue;
      }
      msg += res[0] + '\n';
      res = bracketsreg.exec(description);
    }
  }
  return msg;
}

function main() {
  var items = getItems();
  lastDate = new Date(PropertiesService.getScriptProperties().getProperty('lastDate'));
  latest = lastDate;
  for (var i in items) {
    var msg = textProcess(items[i]);
    if(msg) {
      send({
        "method": "sendMessage",
        "chat_id": "@shinning_nikki_weibo_code",
        "text": msg,
      });
    }
  }
}