import { RequestConfig } from '../http'

export interface Provider {
    sendRequest(config: RequestConfig): Promise<any>;
}

