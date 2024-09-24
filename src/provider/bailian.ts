import axios from 'axios';
import { Provider } from './provider';
import { RequestConfig } from '../http'

export default class BailianProvider implements Provider {
    private APP_ID: string;
    private API_KEY: string;

    constructor(appId: string, apiKey: string) {
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
