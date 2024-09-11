import * as vscode from 'vscode';
import axios from 'axios';

interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    // headers?: Record<string, string>;
    data?: any;
    params?: Record<string, any>;
}

/**
 * 发送 HTTP 请求的通用函数
 * @param config 请求配置对象
 * @returns Promise 包含响应数据
 */
export async function sendHttpRequest(config: RequestConfig): Promise<any> {
    // 获取配置项
    const ext_config = vscode.workspace.getConfiguration('ai-translate');

    //    // 读取配置项
    const APP_ID = ext_config.get<boolean>('APP_ID');
    const API_KEY = ext_config.get<string>('API_KEY');

    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
    }

    let url = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;

    try {
        const response = await axios.request({
            timeout: 100000,
            url: url,
            method: config.method || 'GET',
            headers: headers,
            data: config.data,
            params: config.params
        });

        return response.data;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}


// export default sendHttpRequest;