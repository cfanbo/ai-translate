"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showOutputPanel = showOutputPanel;
exports.finishOutputPanel = finishOutputPanel;
var vscode = require("vscode");
var outputChannel;
function showOutputPanel(message) {
    // 如果 outputChannel 未初始化，则创建一个新的实例
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('ai-translate');
    }
    // 显示输出面板并追加消息
    outputChannel.show();
    outputChannel.append(message);
}
function finishOutputPanel() {
    showOutputPanel("\r\n\r\n");
}
