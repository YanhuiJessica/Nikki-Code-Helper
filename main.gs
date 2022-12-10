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

var latest, lastDate;
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

function getItems() {
  let feed = UrlFetchApp.fetch('https://rssh-ub-three-gamma.vercel.app/weibo/user/6498105282').getContentText();
  let doc = XmlService.parse(feed);
  let root = doc.getRootElement();
  let channel = root.getChild('channel');
  let items = channel.getChildren('item');
  return items;
}

function textProcess(item) {
  let date_string = item.getChildText('pubDate');
  let date = new Date(date_string);
  if (lastDate && date <= lastDate) return null;
  else if (date > latest) {
    PropertiesService.getScriptProperties().setProperty('lastDate', date_string);
    latest = date;
  }
  let description = item.getChildText('description');
  let forward = description.indexOf('<blockquote');
  if (forward != -1) description = description.slice(0, forward);
  let msg = "";
  let codereg = new RegExp("<[^>]+>", "g");
  description = description.replace(codereg, ' ');
  if (description.indexOf("兑换码") != -1) {
    let response = UrlFetchApp.fetch('https://api.openai.com/v1/completions', {
      'method': 'post',
      'headers': {
        'authorization': 'Bearer ' + OPENAI_API_KEY,
      },
      'contentType': 'application/json',
      'payload': JSON.stringify({
        'model': 'text-davinci-003',
        'prompt': '请提取以下文本中的兑换码并直接输出:\n' + description,
        'temperature': 0,
        'max_tokens': 16
      })
    });
    msg = JSON.parse(response.getContentText())['choices'][0]['text'];
  }
  return msg.replace(/\n/g, '');
}

function main() {
  let items = getItems();
  lastDate = new Date(PropertiesService.getScriptProperties().getProperty('lastDate'));
  latest = lastDate;
  for (let i in items) {
    let msg = textProcess(items[i]);
    if(msg) {
      send({
        "method": "sendMessage",
        "chat_id": "@shinning_nikki_weibo_code",
        "text": msg,
      });
    }
  }
}