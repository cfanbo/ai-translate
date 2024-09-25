import axios from 'axios';
import { Provider } from './provider';
import { RequestConfig } from '../http';
import { ConfigurationError } from '../error';

export default class BailianProvider implements Provider {
    private APP_ID: string;
    private API_KEY: string;

    constructor(appId: string, apiKey: string) {
        if (!appId) {
            throw new ConfigurationError("配置错误：appId 不能为空");
        }
        if (!apiKey) {
            throw new ConfigurationError("配置错误：apiKey 不能为空");
        }

        this.APP_ID = appId;
        this.API_KEY = apiKey;
    }

    async sendRequest(config: RequestConfig): Promise<any> {
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.API_KEY
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
                }
            });

            return { text: response.data.output.text };
        } catch (error) {
            console.error('Bailian Request failed:', error);
            throw error;
        }
    }
}
