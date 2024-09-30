"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");
var http_1 = require("./http"); // 假设 httpService.ts 在同一目录下
var error_1 = require("./error");
var Loading = false;
function showInputBoxIfNeeded() {
    var showInputBox = vscode.workspace.getConfiguration('myExtension').get('showInputBox');
    if (showInputBox) {
        vscode.window.showInputBox({
            prompt: "Enter a value",
            placeHolder: "Type something here"
        }).then(function (value) {
            if (value !== undefined) {
                vscode.workspace.getConfiguration('myExtension').update('inputValue', value, vscode.ConfigurationTarget.Global);
            }
        });
    }
}
function showOrHideInputBox() {
    var showInputBox = vscode.workspace.getConfiguration('myExtension').get('showInputBox');
    console.log("showInputBox", showInputBox);
    if (showInputBox) {
        vscode.window.showInputBox({
            prompt: "Enter a value",
            placeHolder: "Type something here"
        }).then(function (value) {
            if (value !== undefined) {
                vscode.workspace.getConfiguration('myExtension').update('inputValue', value, vscode.ConfigurationTarget.Global);
            }
        });
    }
    else {
        // 隐藏录入框（这里我们只是不显示录入框，实际隐藏逻辑可能需要更复杂的处理）
        vscode.window.showInformationMessage('Input box is hidden.');
    }
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    var _this = this;
    // 监听配置变化
    vscode.workspace.onDidChangeConfiguration(function (event) {
        console.log(event);
        if (event.affectsConfiguration('myExtension.showInputBox')) {
            showOrHideInputBox();
        }
    });
    // 初始化时检查是否需要显示录入框
    showOrHideInputBox();
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ai-translate" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('ai-translate.Do', function () { return __awaiter(_this, void 0, void 0, function () {
        var editor, selections, selectedText, statusBarItem, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (Loading) {
                        return [2 /*return*/];
                    }
                    Loading = true;
                    editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showWarningMessage("No active text editor found.");
                        return [2 /*return*/];
                    }
                    selections = editor.selections;
                    // 检查是否有选区
                    if (selections.length === 0) {
                        vscode.window.showWarningMessage("No text selected.");
                        return [2 /*return*/];
                    }
                    selectedText = editor.document.getText(selections[0]);
                    console.log(selectedText);
                    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
                    statusBarItem.show();
                    statusBarItem.text = " \uD83D\uDC7E AI\u670D\u52A1\u5668\u6B63\u5728\u62FC\u547D\u7684\u8FD0\u884C...";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, http_1.sendHttpRequest)({
                            input: selectedText,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    if (error_2 instanceof error_1.ConfigurationError) {
                        console.error(error_2.message);
                        // 提示用户进行配置
                        vscode.window.showWarningMessage(error_2.message + '\n 是否立即打开插件配置界面？', { modal: true }, // 设置为 modal 确保对话框是模态的
                        '确认').then(function (selection) {
                            if (selection === '确认') {
                                vscode.commands.executeCommand('workbench.action.openSettings', 'ai-translate');
                            }
                        });
                    }
                    else {
                        // 请求错误
                        vscode.window.showErrorMessage('Failed to fetch data.');
                    }
                    return [3 /*break*/, 4];
                case 4:
                    Loading = false;
                    statusBarItem.dispose();
                    return [2 /*return*/];
            }
        });
    }); });
    context.subscriptions.push(disposable);
    // issue Report
    // const issue = vscode.commands.registerCommand("extension.Issue", () => {
    // 	vscode.window.showInformationMessage("TODO")
    // })
}
// This method is called when your extension is deactivated
function deactivate() {
    console.log("ai-translate is deactived");
}
