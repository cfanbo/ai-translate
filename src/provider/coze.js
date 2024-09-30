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
var vscode = require("vscode");
var axios_1 = require("axios");
var error_1 = require("../error");
var util_1 = require("../util");
var CozeProvider = /** @class */ (function () {
    function CozeProvider(botId, token) {
        if (!botId) {
            throw new error_1.ConfigurationError("botId 不能为空");
        }
        if (!token) {
            throw new error_1.ConfigurationError("token 不能为空");
        }
        // 流式输出
        var ext_config = vscode.workspace.getConfiguration('ai-translate');
        var streamEnabled = ext_config.get('stream') || false;
        this.botId = botId;
        this.token = token;
        this.streamEnabled = streamEnabled;
        this.onDataCallback = util_1.showOutputPanel;
    }
    CozeProvider.prototype.sendRequest = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, data, url, response_1, content, error_2, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        headers = {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + this.token
                        };
                        data = {
                            "bot_id": this.botId,
                            "user_id": "ai-translate",
                            "stream": this.streamEnabled,
                            "auto_save_history": true,
                            "additional_messages": [
                                {
                                    "role": "user",
                                    "content": config.input,
                                    "content_type": "text"
                                }
                            ]
                        };
                        url = "https://api.coze.cn/v3/chat";
                        return [4 /*yield*/, axios_1.default.request({
                                timeout: 100000,
                                url: url,
                                method: 'POST',
                                headers: headers,
                                data: data,
                                responseType: this.streamEnabled ? 'stream' : 'json'
                            })];
                    case 1:
                        response_1 = _a.sent();
                        if (!this.streamEnabled) return [3 /*break*/, 2];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var stream = response_1.data;
                                var bufferText = "";
                                stream.on('data', function (chunk) {
                                    var chunkStr = chunk.toString();
                                    // console.log('Received chunk:', chunkStr);
                                    // eventType
                                    var event = "";
                                    var eventMatch = chunkStr.match(/event:(.*)/);
                                    if (eventMatch && eventMatch[1]) {
                                        event = eventMatch[1].trim();
                                    }
                                    // console.log("event =", event);
                                    // https://www.coze.cn/docs/developer_guides/chat_v3#544e4a28
                                    if (event == "conversation.message.delta") {
                                        var match = chunkStr.match(/data:(.*)/);
                                        if (match && match[1]) {
                                            try {
                                                var jsonData = JSON.parse(match[1].trim());
                                                var text = jsonData.content;
                                                // console.log(text)
                                                // 解决vscode console output 控制台，当输出内容长度过小时，经常性的不打印的 BUG
                                                bufferText += text;
                                                if (bufferText.length > 3) {
                                                    _this.onDataCallback(bufferText); // 调用回调函数
                                                    bufferText = "";
                                                }
                                            }
                                            catch (error) {
                                                console.error('Failed to parse JSON:', error);
                                            }
                                        }
                                    }
                                    // switch (event) {
                                    //     case "conversation.message.delta":
                                    //         console.log("增量消息，通常是 type=answer 时的增量消息。");
                                    //     case "conversation.message.completed":
                                    //         console.log("message 已回复完成");
                                    //     case "conversation.chat.completed":
                                    //         console.log("对话完成");
                                    //     case "conversation.chat.failed":
                                    //         console.log("此事件用于标识对话失败。")
                                    //     case "conversation.chat.requires_action":
                                    //         console.log("对话中断，需要使用方上报工具的执行结果。")
                                    //     case "error":
                                    //         console.log("流式响应过程中的错误事件。关于 code 和 msg 的详细说明，可参考错误码: https://www.coze.cn/docs/developer_guides/coze_error_codes");
                                    //     case "done":
                                    //         console.log("本次会话的流式返回正常结束。");
                                    //     case "conversation.chat.created":
                                    //         console.log("服务端正在处理对话。")
                                    //     case "conversation.chat.in_progress":
                                    //         console.log("创建对话的事件，表示对话开始。")
                                    //     default:
                                    //         console.log(event)
                                    // }
                                });
                                stream.on('end', function () {
                                    console.log("stream data finished");
                                    if (bufferText.length > 0) {
                                        // console.log(bufferText);
                                        _this.onDataCallback(bufferText);
                                        (0, util_1.finishOutputPanel)();
                                    }
                                    resolve({ text: bufferText });
                                });
                                stream.on('error', function (error) {
                                    console.log(error);
                                    reject(error);
                                });
                            })];
                    case 2:
                        if (!(response_1.data.data.status == 'in_progress')) return [3 /*break*/, 8];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        // 1. 检查bot会话状态状态 https://www.coze.cn/docs/developer_guides/get_chat_response
                        return [4 /*yield*/, this.check_session_status(response_1.data.data.conversation_id, response_1.data.data.id)
                            // 2. 获取最后一次bot响应
                        ];
                    case 4:
                        // 1. 检查bot会话状态状态 https://www.coze.cn/docs/developer_guides/get_chat_response
                        _a.sent();
                        return [4 /*yield*/, this.fetch_llm_response(response_1.data.data.conversation_id, response_1.data.data.id)];
                    case 5:
                        content = _a.sent();
                        this.onDataCallback(content);
                        (0, util_1.finishOutputPanel)();
                        return [2 /*return*/, { text: content }];
                    case 6:
                        error_2 = _a.sent();
                        throw error_2;
                    case 7: return [3 /*break*/, 9];
                    case 8: return [2 /*return*/, { text: response_1.data.msg }];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_3 = _a.sent();
                        console.error('Coze Request failed:', error_3);
                        throw error_3;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    CozeProvider.prototype.check_session_status = function (conversation_id, chat_id) {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("check_session_status:", conversation_id, chat_id);
                        url = 'https://api.coze.cn/v3/chat/retrieve';
                        headers = {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + this.token
                        };
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.request({
                                timeout: 100000,
                                url: url,
                                method: 'GET',
                                headers: headers,
                                params: {
                                    conversation_id: conversation_id,
                                    chat_id: chat_id
                                }
                            })];
                    case 3:
                        response = _a.sent();
                        // 检查响应状态
                        if (response.data.data.status !== 'in_progress') {
                            return [2 /*return*/, response.data]; // 返回最终的响应数据
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error('Error fetching response:', error_4);
                        throw error_4; // 重新抛出错误或根据需求处理
                    case 5: 
                    // 加入延迟以避免发送过多请求
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 6:
                        // 加入延迟以避免发送过多请求
                        _a.sent(); // 每次循环等待 1 秒
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CozeProvider.prototype.fetch_llm_response = function (conversation_id, chat_id) {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, response, resp, last_session_idx, idx, item, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("fetch_llm_response:", conversation_id, chat_id);
                        url = ' https://api.coze.cn/v3/chat/message/list';
                        headers = {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + this.token
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.request({
                                timeout: 100000,
                                url: url,
                                method: 'GET',
                                headers: headers,
                                params: {
                                    conversation_id: conversation_id,
                                    chat_id: chat_id
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        resp = response.data;
                        last_session_idx = resp.data.length - 1;
                        for (idx = 0; idx <= last_session_idx; idx++) {
                            item = resp.data[idx];
                            if (item.role == 'assistant' && item.type == 'answer') {
                                return [2 /*return*/, item.content];
                            }
                        }
                        return [2 /*return*/, "Sorry, coze bot Exception!"];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error fetching response:', error_5);
                        throw error_5; // 重新抛出错误或根据需求处理
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CozeProvider;
}());
exports.default = CozeProvider;
