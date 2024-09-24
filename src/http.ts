import * as vscode from 'vscode';
import { Provider } from './provider/provider';
import BailianProvider from './provider/bailian';
import CozeProvider from './provider/coze';

export interface RequestConfig {
    input?: any;
    // headers?: Record<string, string>;
    // data?: any;
    // params?: Record<string, any>;
}

/**
 * 发送 HTTP 请求的通用函数
 * @param config 请求配置对象
 * @returns Promise 包含响应数据
 */
export async function sendHttpRequest(config: RequestConfig): Promise<any> {
    try {
        const provider = createProvider();
        const response = await provider.sendRequest(config);
        return response;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}


function createProvider(): Provider {
    // 获取扩展的配置
    const ext_config = vscode.workspace.getConfiguration('ai-translate');
    const provider = ext_config.get<string>('provider'); // 获取 provider 配置

    if (provider === 'bailian') {
        const APP_ID = ext_config.get<string>('bailian.APP_ID') || '';
        const API_KEY = ext_config.get<string>('bailian.API_KEY') || '';
        return new BailianProvider(APP_ID, API_KEY);
    } else if (provider === 'coze') {
        const botId = ext_config.get<string>('coze.botId') || '';
        const token = ext_config.get<string>('coze.token') || '';
        return new CozeProvider(botId, token);
    } else {
        throw new Error(`Unsupported provider: ${provider}`);
    }
}


// interface Provider {
//     sendRequest(config: RequestConfig): Promise<any>;
// }

// class BailianProvider implements Provider {
//     private APP_ID: string;
//     private API_KEY: string;

//     constructor(appId: string, apiKey: string) {
//         this.APP_ID = appId;
//         this.API_KEY = apiKey;
//     }

//     async sendRequest(config: RequestConfig): Promise<any> {
//         let headers = {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + this.API_KEY
//         }

//         let url = `https://dashscope.aliyuncs.com/api/v1/apps/${this.APP_ID}/completion`;

//         try {
//             const response = await axios.request({
//                 timeout: 100000,
//                 url: url,
//                 method: 'POST',
//                 headers: headers,
//                 data: {
//                     'input': {
//                         'prompt': config.input
//                     }
//                 }
//             });

//             return { text: response.data.output.text };
//         } catch (error) {
//             console.error('Bailian Request failed:', error);
//             throw error;
//         }
//     }
// }


// class CozeProvider implements Provider {
//     private botId: string;
//     private token: string;

//     constructor(botId: string, token: string) {
//         this.botId = botId;
//         this.token = token;
//     }

//     async sendRequest(config: RequestConfig): Promise<any> {
//         try {
//             let headers = {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Bearer ' + this.token
//             }

//             let data = {
//                 "bot_id": this.botId,
//                 "user_id": "ai-translate",
//                 "stream": false,
//                 "auto_save_history": true,
//                 "additional_messages": [
//                     {
//                         "role": "user",
//                         "content": config.input,
//                         "content_type": "text"
//                     }
//                 ]
//             }

//             let url = `https://api.coze.cn/v3/chat`;
//             const response = await axios.request({
//                 timeout: 100000,
//                 url: url,
//                 method: 'POST',
//                 headers: headers,
//                 data: data
//             });

//             if (response.data.data.status == 'in_progress') {
//                 try {
//                     // 1. 检查bot会话状态状态 https://www.coze.cn/docs/developer_guides/get_chat_response
//                     await this.check_session_status(response.data.data.conversation_id, response.data.data.id)
//                     // 2. 获取最后一次bot响应
//                     let content = await this.fetch_llm_response(response.data.data.conversation_id, response.data.data.id)
//                     return { text: content }
//                 } catch (error) {
//                     throw error;
//                 }

//             } else {
//                 return { text: response.data.msg };
//             }

//         } catch (error) {
//             console.error('Coze Request failed:', error);
//             throw error;
//         }
//     }

//     async check_session_status(conversation_id: string, chat_id: string) {
//         console.log("check_session_status:", conversation_id, chat_id)
//         let url = 'https://api.coze.cn/v3/chat/retrieve';
//         let headers = {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + this.token
//         }

//         while (true) { // 使用 while(true) 进行无限循环
//             try {
//                 const response = await axios.request({
//                     timeout: 100000,
//                     url: url,
//                     method: 'GET',
//                     headers: headers,
//                     params: {
//                         conversation_id: conversation_id,
//                         chat_id: chat_id
//                     }
//                 });

//                 // 检查响应状态
//                 if (response.data.data.status !== 'in_progress') {
//                     return response.data; // 返回最终的响应数据
//                 }
//             } catch (error) {
//                 console.error('Error fetching response:', error);
//                 throw error; // 重新抛出错误或根据需求处理
//             }

//             // 加入延迟以避免发送过多请求
//             await new Promise(resolve => setTimeout(resolve, 1000)); // 每次循环等待 1 秒
//         }

//     }

//     async fetch_llm_response(conversation_id: string, chat_id: string) {
//         console.log("fetch_llm_response:", conversation_id, chat_id)
//         let url = ' https://api.coze.cn/v3/chat/message/list';
//         let headers = {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + this.token
//         }

//         try {
//             const response = await axios.request({
//                 timeout: 100000,
//                 url: url,
//                 method: 'GET',
//                 headers: headers,
//                 params: {
//                     conversation_id: conversation_id,
//                     chat_id: chat_id
//                 }
//             });

//             // 检查响应状态
//             let resp = response.data
//             let last_session_idx = resp.data.length - 1

//             for (let idx = 0; idx <= last_session_idx; idx++) {
//                 let item = resp.data[idx]
//                 if (item.role == 'assistant' && item.type == 'answer') {
//                     return item.content
//                 }
//             }

//             return "Sorry, coze bot Exception!"
//         } catch (error) {
//             console.error('Error fetching response:', error);
//             throw error; // 重新抛出错误或根据需求处理
//         }
//     }
// }


// export default sendHttpRequest;