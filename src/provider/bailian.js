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
var BailianProvider = /** @class */ (function () {
    function BailianProvider(appId, apiKey) {
        if (!appId) {
            throw new error_1.ConfigurationError("配置错误：appId 不能为空");
        }
        if (!apiKey) {
            throw new error_1.ConfigurationError("配置错误：apiKey 不能为空");
        }
        // 流式输出
        var ext_config = vscode.workspace.getConfiguration('ai-translate');
        var streamEnabled = ext_config.get('stream') || false;
        this.APP_ID = appId;
        this.API_KEY = apiKey;
        this.streamEnabled = streamEnabled;
        this.onDataCallback = util_1.showOutputPanel;
    }
    BailianProvider.prototype.sendRequest = function (config, onData) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, url, response_1, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + this.API_KEY,
                        };
                        if (this.streamEnabled) {
                            headers['Accept'] = 'text/event-stream'; // 在这里直接设置
                        }
                        url = "https://dashscope.aliyuncs.com/api/v1/apps/".concat(this.APP_ID, "/completion");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.request({
                                timeout: 100000,
                                url: url,
                                method: 'POST',
                                headers: headers,
                                data: {
                                    'input': {
                                        'prompt': config.input
                                    },
                                    parameters: {
                                        incremental_output: this.streamEnabled
                                    }
                                },
                                responseType: this.streamEnabled ? 'stream' : 'json'
                            })];
                    case 2:
                        response_1 = _a.sent();
                        if (this.streamEnabled) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var stream = response_1.data;
                                    stream.on('data', function (chunk) {
                                        var chunkStr = chunk.toString();
                                        // console.log('Received chunk:', chunkStr);
                                        var match = chunkStr.match(/data:(.*)/);
                                        if (match && match[1]) {
                                            try {
                                                var jsonData = JSON.parse(match[1].trim());
                                                var text = jsonData.output.text;
                                                _this.onDataCallback(text); // 调用回调函数
                                            }
                                            catch (error) {
                                                console.error('Failed to parse JSON:', error);
                                            }
                                        }
                                    });
                                    stream.on('end', function () {
                                        console.log("stream data finished");
                                        (0, util_1.finishOutputPanel)();
                                        resolve({ text: "complete" });
                                    });
                                    stream.on('error', function (error) {
                                        reject(error);
                                    });
                                })];
                        }
                        else {
                            this.onDataCallback(response_1.data.output.text);
                            (0, util_1.finishOutputPanel)();
                            return [2 /*return*/, { text: response_1.data.output.text }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Bailian Request failed:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return BailianProvider;
}());
exports.default = BailianProvider;
