"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var error_1 = require("../error");
var util_1 = require("../util");
var openai_1 = require("openai");
var sdk_1 = require("@anthropic-ai/sdk");
var LLMProvider = /** @class */ (function () {
    function LLMProvider(options) {
        if (options === void 0) { options = {}; }
        this.prompt = "";
        this.target_language = 'Chinese';
        // 读取配置
        var ext_config = vscode.workspace.getConfiguration('ai-translate');
        var streamEnabled = ext_config.get('stream') || false;
        this.providerConfig = {
            provider: ext_config.get('LLM.ServiceProvider') || "",
            baseUrl: ext_config.get('LLM.baseUrl') || "",
            apiKey: ext_config.get('LLM.apiKey') || "",
            model: ext_config.get('LLM.model') || "",
        };
        console.log(this.providerConfig);
        if (!this.providerConfig.apiKey) {
            throw new error_1.ConfigurationError("apiKey 不能为空");
        }
        if (!this.providerConfig.model) {
            throw new error_1.ConfigurationError("model 不能为空");
        }
        this.systemPrompt = "\n        You are a highly skilled translation engine with expertise in the technology sector. Your function is to translate texts accurately into the target ".concat(this.target_language, ",\n    maintaining the original format, technical terms, and abbreviations. Do not add any explanations or annotations to the translated text.\n    ");
        // 默认值
        var defaultOptions = {
            temperature: 1,
            max_tokens: 4096,
            top_p: 1,
            n: 1,
            stop: null,
            stream: false,
        };
        this.options = __assign(__assign({}, defaultOptions), options);
        this.options.stream = streamEnabled;
        // render callback
        this.onDataCallback = util_1.showOutputPanel;
    }
    LLMProvider.prototype.setSystemPrompt = function (systemPrompt) {
        this.systemPrompt = systemPrompt;
    };
    LLMProvider.prototype.setPrompt = function (text) {
        this.prompt = "\n        Translate the following source text to ".concat(this.target_language, ", Output translation directly without any additional text.\n    Source Text: ").concat(text, "\n    Translated Text:\n        ");
    };
    LLMProvider.prototype.callOpenAI = function () {
        return __awaiter(this, void 0, void 0, function () {
            var messages, client, stream, fullResponse, _a, stream_1, stream_1_1, chunk, content, e_1_1, response, resultStr, error_2;
            var _b, e_1, _c, _d;
            var _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        messages = [
                            { role: "system", content: this.systemPrompt },
                            { role: "user", content: this.prompt },
                        ];
                        client = new openai_1.OpenAI({
                            apiKey: this.providerConfig.apiKey,
                            baseURL: this.providerConfig.baseUrl,
                        });
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 18, , 19]);
                        if (!this.options.stream) return [3 /*break*/, 15];
                        return [4 /*yield*/, client.chat.completions.create(__assign(__assign({ model: this.providerConfig.model, messages: messages }, this.options), { stream: this.options.stream }))];
                    case 2:
                        stream = _h.sent();
                        fullResponse = '';
                        _h.label = 3;
                    case 3:
                        _h.trys.push([3, 8, 9, 14]);
                        _a = true, stream_1 = __asyncValues(stream);
                        _h.label = 4;
                    case 4: return [4 /*yield*/, stream_1.next()];
                    case 5:
                        if (!(stream_1_1 = _h.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 7];
                        _d = stream_1_1.value;
                        _a = false;
                        chunk = _d;
                        content = ((_f = (_e = chunk.choices[0]) === null || _e === void 0 ? void 0 : _e.delta) === null || _f === void 0 ? void 0 : _f.content) || '';
                        this.onDataCallback(content); // 调用回调函数
                        fullResponse += content;
                        process.stdout.write(content);
                        _h.label = 6;
                    case 6:
                        _a = true;
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 14];
                    case 8:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 14];
                    case 9:
                        _h.trys.push([9, , 12, 13]);
                        if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 11];
                        return [4 /*yield*/, _c.call(stream_1)];
                    case 10:
                        _h.sent();
                        _h.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 13: return [7 /*endfinally*/];
                    case 14:
                        (0, util_1.finishOutputPanel)();
                        return [2 /*return*/, fullResponse.trim()];
                    case 15: return [4 /*yield*/, client.chat.completions.create(__assign(__assign({ model: this.providerConfig.model, messages: messages }, this.options), { stream: this.options.stream }))];
                    case 16:
                        response = _h.sent();
                        resultStr = ((_g = response.choices[0].message.content) === null || _g === void 0 ? void 0 : _g.trim()) || '';
                        this.onDataCallback(resultStr);
                        (0, util_1.finishOutputPanel)();
                        return [2 /*return*/, resultStr];
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        error_2 = _h.sent();
                        console.error("An unexpected error occurred: ".concat(error_2));
                        throw error_2; // 或者返回一个默认值，如 return '';
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    LLMProvider.prototype.callAnthropic = function () {
        return __awaiter(this, void 0, void 0, function () {
            var messages, client, response, fullResponse, _a, response_1, response_1_1, event_1, content, e_2_1, resultStr, error_3;
            var _b, e_2, _c, _d;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        messages = [
                            { role: "user", content: this.prompt }
                        ];
                        client = new sdk_1.Anthropic({ baseURL: this.providerConfig.baseUrl, apiKey: this.providerConfig.apiKey });
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 17, , 18]);
                        return [4 /*yield*/, client.messages.create({
                                model: this.providerConfig.model,
                                system: this.systemPrompt,
                                messages: messages,
                                max_tokens: 1024,
                                // ...this.options,
                                stream: this.options.stream,
                            })];
                    case 2:
                        response = _f.sent();
                        if (!this.options.stream) return [3 /*break*/, 15];
                        fullResponse = "";
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 8, 9, 14]);
                        _a = true, response_1 = __asyncValues(response);
                        _f.label = 4;
                    case 4: return [4 /*yield*/, response_1.next()];
                    case 5:
                        if (!(response_1_1 = _f.sent(), _b = response_1_1.done, !_b)) return [3 /*break*/, 7];
                        _d = response_1_1.value;
                        _a = false;
                        event_1 = _d;
                        if (event_1.type === "content_block_delta") {
                            content = ((_e = event_1.delta) === null || _e === void 0 ? void 0 : _e.text) || "";
                            this.onDataCallback(content);
                            fullResponse += content;
                            process.stdout.write(content); // Stream to console
                        }
                        _f.label = 6;
                    case 6:
                        _a = true;
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 14];
                    case 8:
                        e_2_1 = _f.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 14];
                    case 9:
                        _f.trys.push([9, , 12, 13]);
                        if (!(!_a && !_b && (_c = response_1.return))) return [3 /*break*/, 11];
                        return [4 /*yield*/, _c.call(response_1)];
                    case 10:
                        _f.sent();
                        _f.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 13: return [7 /*endfinally*/];
                    case 14:
                        (0, util_1.finishOutputPanel)();
                        return [2 /*return*/, fullResponse];
                    case 15:
                        resultStr = "";
                        if (response.type == "message") {
                            resultStr = response.content[0].text;
                        }
                        else {
                            resultStr = JSON.stringify(response.error);
                        }
                        this.onDataCallback(resultStr);
                        (0, util_1.finishOutputPanel)();
                        return [2 /*return*/, resultStr || null];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_3 = _f.sent();
                        // Handle API or other errors
                        console.error("Error occurred: ".concat(error_3));
                        return [2 /*return*/, null];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    LLMProvider.prototype.sendRequest = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setPrompt(config.input);
                        if (!(this.providerConfig.provider === "Anthropic")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.callAnthropic()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.callOpenAI()];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return LLMProvider;
}());
exports.default = LLMProvider;
