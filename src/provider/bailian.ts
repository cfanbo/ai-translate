import * as vscode from 'vscode';
import axios from 'axios';
import { Readable } from 'stream';
import { Provider } from './provider';
import { RequestConfig } from '../http';
import { ConfigurationError } from '../error';
import { showOutputPanel } from '../util';

export default class BailianProvider implements Provider {
    private APP_ID: string;
    private API_KEY: string;
    private streamEnabled: boolean;
    private onDataCallback: (chunk: string) => void;  // 回调函数

    constructor(appId: string, apiKey: string) {
        if (!appId) {
            throw new ConfigurationError("配置错误：appId 不能为空");
        }
        if (!apiKey) {
            throw new ConfigurationError("配置错误：apiKey 不能为空");
        }

        // 流式输出
        const ext_config = vscode.workspace.getConfiguration('ai-translate');
        const streamEnabled = ext_config.get<boolean>('stream') || false;

        this.APP_ID = appId;
        this.API_KEY = apiKey;
        this.streamEnabled = streamEnabled;
        this.onDataCallback = showOutputPanel;
    }

    async sendRequest(config: RequestConfig, onData?: (chunk: string) => void): Promise<any> {
        let headers: { 'Content-Type': string; Authorization: string; Accept?: string } = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.API_KEY,
        };

        if (this.streamEnabled) {
            headers['Accept'] = 'text/event-stream'; // 在这里直接设置
        }

        let url = `https://dashscope.aliyuncs.com/api/v1/apps/${this.APP_ID}/completion`;

        try {
            const response = await axios.request({
                timeout: 100000,
                url: url,
                method: 'POST',
                headers: headers,
                data: {
                    'input': {
                        'prompt': config.input
                    }
                },
                responseType: this.streamEnabled ? 'stream' : 'json'
            });

            if (this.streamEnabled) {
                return new Promise((resolve, reject) => {
                    const stream = response.data as Readable;

                    let usedIndex = 0;
                    stream.on('data', (chunk: Buffer) => {
                        const chunkStr = chunk.toString();
                        console.log('Received chunk:', chunkStr);

                        const match = chunkStr.match(/data:(.*)/);
                        if (match && match[1]) {
                            try {
                                const jsonData = JSON.parse(match[1].trim());
                                let text = jsonData.output.text;

                                let newText = text.substring(usedIndex)
                                this.onDataCallback(newText);  // 调用回调函数

                                usedIndex = text.length
                            } catch (error) {
                                console.error('Failed to parse JSON:', error);
                            }
                        }
                    });

                    stream.on('end', () => {
                        console.log("stream data finished")
                        if (usedIndex > 0) {
                            this.onDataCallback("\r\n\r\n");
                        }
                        resolve({ text: "complete" });
                    });

                    stream.on('error', (error) => {
                        reject(error);
                    });
                });
            } else {
                this.onDataCallback(response.data.output.text)
                return { text: response.data.output.text };
            }
        } catch (error) {
            console.error('Bailian Request failed:', error);
            throw error;
        }
    }
}
