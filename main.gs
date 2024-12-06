/*
Copyright 2021 YanhuiJessica
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var shinningLatest, shinningLastDate;
var infinityLatest, infinityLastDate;
var OPENAI_API_KEY = '<openai-api-key>';

function send(payload) {
  if (payload) {
    let data = {
      "method": "post",
      "payload": payload,
      "muteHttpExceptions": true
    }
    response = UrlFetchApp.fetch("https://api.telegram.org/bot<bot-token>/", data);
    Logger.log(response.getContentText());
  }
}

function getItems(uid) {
  let feed = UrlFetchApp.fetch('https://rssh-ub-three-gamma.vercel.app/weibo/user/' + uid).getContentText();
  let doc = XmlService.parse(feed);
  let root = doc.getRootElement();
  let channel = root.getChild('channel');
  let items = channel.getChildren('item');
  return items;
}

function textProcess(item, lastDate, isShinningNikki) {
  let date_string = item.getChildText('pubDate');
  let date = new Date(date_string);
  if (lastDate && date <= lastDate) return null;
  else if (isShinningNikki && date > shinningLatest) {
    PropertiesService.getScriptProperties().setProperty('shinningLastDate', date_string);
    shinningLatest = date;
  }
  else if (!isShinningNikki && date > infinityLatest) {
    PropertiesService.getScriptProperties().setProperty('infinityLastDate', date_string);
    infinityLatest = date;
  }
  let description = item.getChildText('description');
  let forward = description.indexOf('<blockquote');
  if (forward != -1) description = description.slice(0, forward);
  let msg = "";
  let codereg = new RegExp("<[^>]+>", "g");
  description = description.replace(codereg, ' ');
  if (description.indexOf("兑换码") != -1) {
    let response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      'method': 'post',
      'headers': {
        'authorization': 'Bearer ' + OPENAI_API_KEY,
      },
      'contentType': 'application/json',
      'payload': JSON.stringify({
        'model': 'gpt-4o',
        'messages': [
          {
            "role": "system",
            "content": '请提取以下文本中的兑换码并直接输出，若无则查看是否有其它获取方式并直接输出:\n' + description,
          }
        ],
        'temperature': 0,
        'max_tokens': 128
      })
    });
    msg = JSON.parse(response.getContentText())['choices'][0]['message']['content'];
  }
  return msg.replace(/\n/g, '');
}

function main() {
  // shinning nikki
  shinningLastDate = new Date(PropertiesService.getScriptProperties().getProperty('shinningLastDate'));
  shinningLatest = shinningLastDate;
  let targets = ['6498105282', '7840676854', '7521490767'];
  let items = getItems(targets[0]);
  for (let i = 1; i < targets.length; i ++) {
    items = items.concat(getItems(targets[i]));
  }
  for (let i in items) {
    let msg = textProcess(items[i], shinningLastDate, true);
    if(msg) {
      send({
        "method": "sendMessage",
        "chat_id": "@shinning_nikki_weibo_code",
        "text": msg,
      });
    }
  }

  // infinity nikki
  shinningLastDate = new Date(PropertiesService.getScriptProperties().getProperty('infinityLastDate'));
  infinityLatest = shinningLastDate;
  targets = ['7801655101', '7915828567', '7915670982'];
  items = getItems(targets[0]);
  for (let i = 1; i < targets.length; i ++) {
    items = items.concat(getItems(targets[i]));
  }
  for (let i in items) {
    let msg = textProcess(items[i], shinningLastDate, false);
    if(msg) {
      send({
        "method": "sendMessage",
        "chat_id": "@infinity_nikki_weibo_code",
        "text": msg,
      });
    }
  }
}