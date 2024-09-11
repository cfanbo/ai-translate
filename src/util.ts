import * as vscode from 'vscode';

export function showOutputPanel(message: string) {
    const outputChannel = vscode.window.createOutputChannel('ai-translate');
    outputChannel.show();
    outputChannel.appendLine(message);
}
