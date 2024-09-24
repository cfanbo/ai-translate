import axios from 'axios';
import { Provider } from './provider';
import { RequestConfig } from '../http'

export default class CozeProvider implements Provider {
    private botId: string;
    private token: string;

    constructor(botId: string, token: string) {
        this.botId = botId;
        this.token = token;
    }

    async sendRequest(config: RequestConfig): Promise<any> {
        try {
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.token
            }

            let data = {
                "bot_id": this.botId,
                "user_id": "ai-translate",
                "stream": false,
                "auto_save_history": true,
                "additional_messages": [
                    {
                        "role": "user",
                        "content": config.input,
                        "content_type": "text"
                    }
                ]
            }

            let url = `https://api.coze.cn/v3/chat`;
            const response = await axios.request({
                timeout: 100000,
                url: url,
                method: 'POST',
                headers: headers,
                data: data
            });

            if (response.data.data.status == 'in_progress') {
                try {
                    // 1. 检查bot会话状态状态 https://www.coze.cn/docs/developer_guides/get_chat_response
                    await this.check_session_status(response.data.data.conversation_id, response.data.data.id)
                    // 2. 获取最后一次bot响应
                    let content = await this.fetch_llm_response(response.data.data.conversation_id, response.data.data.id)
                    return { text: content }
                } catch (error) {
                    throw error;
                }

            } else {
                return { text: response.data.msg };
            }

        } catch (error) {
            console.error('Coze Request failed:', error);
            throw error;
        }
    }

    async check_session_status(conversation_id: string, chat_id: string) {
        console.log("check_session_status:", conversation_id, chat_id)
        let url = 'https://api.coze.cn/v3/chat/retrieve';
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.token
        }

        while (true) { // 使用 while(true) 进行无限循环
            try {
                const response = await axios.request({
                    timeout: 100000,
                    url: url,
                    method: 'GET',
                    headers: headers,
                    params: {
                        conversation_id: conversation_id,
                        chat_id: chat_id
                    }
                });

                // 检查响应状态
                if (response.data.data.status !== 'in_progress') {
                    return response.data; // 返回最终的响应数据
                }
            } catch (error) {
                console.error('Error fetching response:', error);
                throw error; // 重新抛出错误或根据需求处理
            }

            // 加入延迟以避免发送过多请求
            await new Promise(resolve => setTimeout(resolve, 1000)); // 每次循环等待 1 秒
        }

    }

    async fetch_llm_response(conversation_id: string, chat_id: string) {
        console.log("fetch_llm_response:", conversation_id, chat_id)
        let url = ' https://api.coze.cn/v3/chat/message/list';
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.token
        }

        try {
            const response = await axios.request({
                timeout: 100000,
                url: url,
                method: 'GET',
                headers: headers,
                params: {
                    conversation_id: conversation_id,
                    chat_id: chat_id
                }
            });

            // 检查响应状态
            let resp = response.data
            let last_session_idx = resp.data.length - 1

            for (let idx = 0; idx <= last_session_idx; idx++) {
                let item = resp.data[idx]
                if (item.role == 'assistant' && item.type == 'answer') {
                    return item.content
                }
            }

            return "Sorry, coze bot Exception!"
        } catch (error) {
            console.error('Error fetching response:', error);
            throw error; // 重新抛出错误或根据需求处理
        }
    }
}