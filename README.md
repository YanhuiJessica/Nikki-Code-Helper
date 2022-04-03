# Nikki-Code-Helper

电报机器人 - 闪暖微博兑换码bot [@nikki_redeem_code_bot](https://t.me/nikki_redeem_code_bot)

频道 - 闪耀暖暖微博兑换码 [@shinning_nikki_weibo_code](https://t.me/shinning_nikki_weibo_code)

[![](https://img.shields.io/badge/dynamic/xml?color=blue&label=闪耀暖暖微博兑换码&logo=telegram&query=%2Fhtml%2Fbody%2Fdiv%5B2%5D%2Fdiv%5B2%5D%2Fdiv%2Fdiv%5B3%5D&url=https%3A%2F%2Ft.me%2Fshinning_nikki_weibo_code)](https://t.me/shinning_nikki_weibo_code)

## 这只机器人能干嘛？

- 通过 RSS 服务获得最新微博文本内容并分析
- 识别两种兑换码
  - 正则匹配获得 12 位兑换码
    - 可能匹配到非兑换码，目前采用黑名单机制
  - 当文本中存在 `兑换码` 时，匹配`【 】`内的内容
- 兑换码消息推送到频道

## 这只机器人不能干嘛？

- 不会说话 XD 任何私戳都不会有结果的 🤐
- 无法获得评论区兑换码 🤧