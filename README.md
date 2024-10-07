# AI Translate

<div style="text-align: center;">
    <img src="./img/logo.png" alt="AI Translate" />
</div>

`ai-translate` 是一款基于大语言模型开发的 VSCode 翻译插件，专为开发者设计，主要用在IDE环境中对英文内容进行翻译。

它的优势是相比传统翻译工具更专业、友好，更加贴合技术背景。

> 如果您使用的是 JetBrains 系列IDE工具，则需要安装对应IDE版本插件 https://plugins.jetbrains.com/plugin/25313-ai-translate

## Features

基于AI实现更专业的翻译效果。
例如，这里是一段对 `Raft` 代码的注释
```go
// If s.isLeader() returns true, but we fail to ensure the current
// member's leadership, there are a couple of possibilities:
//   1. current member gets stuck on writing WAL entries;
//   2. current member is in network isolation status;
//   3. current member isn't a leader anymore (possibly due to #1 above).
// In such case, we just return error to client, so that the client can
// switch to another member to continue the lease keep-alive operation.
```
AI翻译效果
```
如果 s.isLeader() 返回 true，但我们未能确保当前成员的领导地位，可能存在几种情况：
1. 当前成员在写入 WAL 日志条目时卡住；
2. 当前成员处于网络隔离状态；
3. 当前成员已不再是领导者（可能是由于上述第 1 点）。
在这种情况下，我们直接向客户端返回错误，以便客户端可以切换到另一个成员继续租约续期操作。
```

> 基于AI的翻译效果要比传统翻译软件更加精准和专业，特别是我们可以对AI应用做一些自定义功能，如这里会自动过滤掉注释符，并整理形成新的段落语句，然后再翻译成中文。
>
> 除此之外，通义千问应用还支持更多的定制化功能，如插件调用这里只是用到了一小部分而已。

## Requirements

翻译功能主要是由LLM来提供，目前支持的服务提供商：

- OpenAI
- Anthropic
- DeepL
- 智谱 GLM
- 豆包大模型（字节跳动）
- DeepSeek
- Alibaba
- GitHub
- Gemini
- [阿里云百炼-智能体](./docs/bailian.md) 获取 `APP_ID` 和 `APP_KEY`
- [扣子coze-智能体](./docs/coze.md) 获取 `BotID` 和 `token`

## install Extension

访问 https://marketplace.visualstudio.com/items?itemName=cfanbo.ai-translate 一键安装

## Extension Settings

在 vscode 里需要对  `ai-translate` 进行配置，分别填写到对应的地址

![alt text](./img/image.jpg)

如果选择了其中一个服务提供商，则必须填写对应的配置，否则无法实现翻译功能。未选择的服务商配置可以保留为空。

## Usage Guide
常见的两种使用方法：

方法一：鼠标选择要翻译的注释段落，右链选择菜单`AI 翻译`即可
方法二：使用快捷键
- "MacOS": `command+alt+t`
- "Linux": `ctrl+alt+t`
- "Windows": `ctrl+alt+t`

## Other
### 智能体
如何选择了 `阿里云百炼` 或 `扣子coze` 智能体服务商，则插件要做的只有一件事，就是将用户选择的内容发送到 LLM, 然后LLM根据用户设置的`prompt`进行响应，并在客户端将响应结果输出。因此用户可以对`prompt`做一切想做的工作，如利用AI给出一些推荐变量命名，同时还可以开启`插件`功能查看天气预报、查询公交地铁信息等。

如果选择的是其它 Provider, 则只做翻译一项功能。

## 反馈意见
如果你在使用插件的过程中遇到任何问题，或发现插件BUG, 或更好的建议，请 [提交反馈](https://github.com/cfanbo/vscode-ai-translate/pulls) 给我们。

**Enjoy!**
