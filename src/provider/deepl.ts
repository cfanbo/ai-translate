import * as vscode from 'vscode';
import axios from 'axios';
import internal, { Readable } from 'stream';
import { Provider } from './provider';
import { RequestConfig } from '../http'
import { ConfigurationError } from '../error';
import { showOutputPanel, finishOutputPanel } from '../util';
import * as deepl from 'deepl-node';



type CommonLanguageCode = 'ar' | 'bg' | 'cs' | 'da' | 'de' | 'el' | 'es' | 'et' | 'fi' | 'fr' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'lt' | 'lv' | 'nb' | 'nl' | 'pl' | 'ro' | 'ru' | 'sk' | 'sl' | 'sv' | 'tr' | 'uk' | 'zh';
const commonLanguageMap: Record<string, CommonLanguageCode | ''> = {
    "Simplified Chinese": 'zh',
    "English": '', // 没有对应的简写
    "Japanese": 'ja',
    "Korean": 'ko',
    "Spanish": 'es',
    "German": 'de',
    "French": 'fr',
    "Russian": 'ru',
    "Arabic": 'ar',
    "Italian": 'it',
    "Malay": '',
    "Indonesian": 'id',
    "Vietnamese": '',
    "Afrikaans": '',
    "Thai": '',
    "Urdu": '',
    "Cantonese (Traditional)": '',
    "Northeastern Chinese": '',
    "Tibetan": '',
    "Classical Chinese": '',
    "Amharic": '',
    "Azerbaijani": '',
    "Belarusian": '',
    "Bulgarian": 'bg',
    "Bengali": '',
    "Bosnian": '',
    "Catalan": '',
    "Cebuano": '',
    "Corsican": '',
    "Czech": 'cs',
    "Welsh": '',
    "Danish": 'da',
    "Greek": 'el',
    "Esperanto": '',
    "Estonian": 'et',
    "Basque": '',
    "Persian": '',
    "Finnish": 'fi',
    "Filipino": '',
    "Fijian": '',
    "Frisian": '',
    "Irish": '',
    "Scottish Gaelic": '',
    "Galician": '',
    "Gujarati": '',
    "Hausa": '',
    "Hawaiian": '',
    "Hebrew": '',
    "Hindi": '',
    "Hmong": '',
    "Croatian": '',
    "Haitian Creole": '',
    "Hungarian": 'hu',
    "Armenian": '',
    "Igbo": '',
    "Icelandic": '',
    "Javanese": '',
    "Georgian": '',
    "Kazakh": '',
    "Khmer": '',
    "Kannada": '',
    "Kurdish": '',
    "Kyrgyz": '',
    "Latin": '',
    "Luxembourgish": '',
    "Lao": '',
    "Lithuanian": 'lt',
    "Latvian": 'lv',
    "Malagasy": '',
    "Maori": '',
    "Macedonian": '',
    "Malayalam": '',
    "Mongolian": '',
    "Marathi": '',
    "Maltese": '',
    "Burmese": '',
    "Dutch": 'nl',
    "Punjabi": '',
    "Polish": 'pl',
    "Pashto": '',
    "Romanian": 'ro',
    "Sanskrit": '',
    "Sinhala": '',
    "Slovak": 'sk',
    "Slovenian": 'sl',
    "Samoan": '',
    "Shona": '',
    "Somali": '',
    "Albanian": '',
    "Serbian": '',
    "Serbian (Cyrillic)": '',
    "Serbian (Latin)": '',
    "Sesotho": '',
    "Sundanese": '',
    "Swedish": 'sv',
    "Swahili": '',
    "Tamil": '',
    "Telugu": '',
    "Tajik": '',
    "Turkish": 'tr',
    "Uyghur": '',
    "Ukrainian": 'uk',
    "Uzbek": '',
    "Xhosa": '',
    "Yiddish": '',
    "Yoruba": '',
    "Zulu": '',
    "Roman Urdu": ''
};

const targetLanguageMap: Record<string, deepl.TargetLanguageCode> = {
    "Traditional Chinese": "ZH-HANT" as deepl.TargetLanguageCode,
    "Portuguese": 'pt-PT' as deepl.TargetLanguageCode,
    "Portuguese (Brazil)": 'pt-BR' as deepl.TargetLanguageCode,
};

interface Config {
    apiURL: string,
    authKey: string,
}

export default class DeepL {
    private config: Config;

    private sourceLang: string | null = null;
    private targetLang: string = '';
    private text: string = "";

    private translator: deepl.Translator;
    private options?: deepl.TranslateTextOptions;

    private onDataCallback: (chunk: string) => void;  // 回调函数

    constructor(apiUrl: string, authKey: string) {
        this.onDataCallback = showOutputPanel;

        this.config = {
            // apiURL: "https://api-free.deepl.com",
            // authKey: "279a2e9d-83b3-c416-7e2d-f721593e42a0:fx",
            apiURL: apiUrl,
            authKey: authKey
        };

        this.translator = new deepl.Translator(this.config.authKey);
    }

    public async deepL(): Promise<string | null> {
        try {
            const sourceLang = await this.getSourceLanguage();
            const targetLang = await this.getTargetLanguage();

            const results = await this.translator.translateText(
                [this.text],
                sourceLang,
                targetLang,
                this.options
            );

            console.log(results)

            const resultStr = results[0].text
            this.onDataCallback(resultStr);
            finishOutputPanel();

            return resultStr;
        } catch (error) {
            console.error('Error in deepL:', error);
            throw error;
        }
    }

    private async getSourceLanguage(): Promise<deepl.SourceLanguageCode | null> {
        if (this.sourceLang == null) {
            return null;
        }

        const sourceLanguages = await this.translator.getSourceLanguages();
        for (let i = 0; i < sourceLanguages.length; i++) {
            const lang = sourceLanguages[i];
            console.log(`${lang.name} (${lang.code})`); // Example: 'English (en)'

            if (lang.name == this.sourceLang) {
                return lang.code as deepl.SourceLanguageCode;
            }
        }

        return null;
    }

    private async getTargetLanguage(): Promise<deepl.TargetLanguageCode> {
        const targetLanguages = await this.translator.getTargetLanguages();
        for (let i = 0; i < targetLanguages.length; i++) {
            const lang = targetLanguages[i];
            if (lang.supportsFormality) {
                if (lang.name == this.targetLang) {
                    return lang.code as deepl.TargetLanguageCode;
                }
            }
        }

        const langMap = await this.getLangMap(this.targetLang)
        if (langMap != null) {
            return langMap;
        }

        throw new Error(`Unsupported target lang: ${this.targetLang}`);
    }

    public setText(text: string): this {
        this.text = text;
        return this;
    }

    public setTargetLang(lang: string): this {
        this.targetLang = lang;
        return this;
    }

    private async getLangMap(lang: string): Promise<deepl.TargetLanguageCode | null> {
        if (lang in commonLanguageMap) {
            let language = commonLanguageMap[lang]
            if (language != "") {
                return language;
            }
        }

        if (lang in targetLanguageMap) {
            return Promise.resolve(targetLanguageMap[lang]);
        }

        return Promise.resolve(null);
    }

}
