// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { sendHttpRequest } from './http'; // 假设 httpService.ts 在同一目录下
import { showOutputPanel } from './util';

var Loading = false;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ai-translate" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('ai-translate.Do', async () => {
		if (Loading) {
			return
		}
		Loading = true

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage("No active text editor found.");
			return;
		}

		// 获取当前选区
		const selections = editor.selections;

		// 检查是否有选区
		if (selections.length === 0) {
			vscode.window.showWarningMessage("No text selected.");
			return;
		}

		// 获取第一个选区的文本
		const selectedText = editor.document.getText(selections[0]);
		console.log(selectedText)

		// 在状态栏显示
		// const loadingMessage = vscode.window.setStatusBarMessage('AI服务器正在处理，请稍候...')
		const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
		statusBarItem.show();
		statusBarItem.text = ` 👾 AI服务器正在拼命的运行...`

		// 使用封装的函数发送 HTTP 请求
		try {
			const response = await sendHttpRequest({
				input: selectedText,
			});

			console.log(response);
			let body = response.text
			showOutputPanel(body);
		} catch (error) {
			vscode.window.showErrorMessage('Failed to fetch data.');
		}

		Loading = false
		statusBarItem.dispose();
	});

	context.subscriptions.push(disposable);

	// issue Report
	// const issue = vscode.commands.registerCommand("extension.Issue", () => {
	// 	vscode.window.showInformationMessage("TODO")
	// })
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log("ai-translate is deactived")
}
