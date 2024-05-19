"use strict";
/*
  A script that uses playwright to quickly generate screenshots
  for my Web App Manifest
*/
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var playwright_1 = require("playwright");
function generateScreenshots() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, context, page;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, playwright_1.chromium.launch()];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newContext()];
                case 2:
                    context = _a.sent();
                    return [4 /*yield*/, context.newPage()];
                case 3:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto('http://localhost:3002')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, setUpApp(page)];
                case 5:
                    _a.sent();
                    // emulate ipad air in landscape mode
                    return [4 /*yield*/, page.setViewportSize({ width: 1024, height: 768 })];
                case 6:
                    // emulate ipad air in landscape mode
                    _a.sent();
                    return [4 /*yield*/, standardScreenshots(page, "desktop")];
                case 7:
                    _a.sent();
                    // set viewport size to a pixel 8
                    return [4 /*yield*/, page.setViewportSize({ width: 412, height: 915 })];
                case 8:
                    // set viewport size to a pixel 8
                    _a.sent();
                    return [4 /*yield*/, standardScreenshots(page, "mobile")];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, browser.close()];
                case 10:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function standardScreenshots(page, platform) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.emulateMedia({ colorScheme: 'dark' })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.reload()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, sendChat(page)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.waitForTimeout(2000)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.screenshot({ path: "public/assets/screenshots/chat-dark-".concat(platform, ".png") })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.emulateMedia({ colorScheme: 'light' })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, page.screenshot({ path: "public/assets/screenshots/chat-light-".concat(platform, ".png") })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, page.emulateMedia({ colorScheme: 'dark' })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, page.reload()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, page.waitForTimeout(2000)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, page.screenshot({ path: "public/assets/screenshots/home-dark-".concat(platform, ".png") })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, page.emulateMedia({ colorScheme: 'light' })];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, page.reload()];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, page.waitForTimeout(2000)];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, page.screenshot({ path: "public/assets/screenshots/home-light-".concat(platform, ".png") })];
                case 15:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function setUpApp(page) {
    return __awaiter(this, void 0, void 0, function () {
        var fluentInput;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fluentInput = page.locator('#intro-content-block fluent-text-field[id="gpt-api-key"] input');
                    // Type an API key into the input.
                    return [4 /*yield*/, fluentInput.fill('sk-proj-jUOsovil2mp2TiUSLxcdT3BlbkFJDXJ1EcWvt5jipczcoJdf')];
                case 1:
                    // Type an API key into the input.
                    _a.sent();
                    return [4 /*yield*/, page.locator('sl-dialog[label="Hello"] key-manager fluent-button').click()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function sendChat(page) {
    return __awaiter(this, void 0, void 0, function () {
        var chatInput, responsePromise;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.route(function (url) { return url.href.includes("sendchatwithactions"); }, function (route) { return __awaiter(_this, void 0, void 0, function () {
                        var json;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    json = {
                                        "id": "chatcmpl-9QTUm9ezolWujORg5rnWa4aO4l5jb",
                                        "choices": [
                                            {
                                                "message": {
                                                    "content": "The current weather at your location is 45.7°F, and it is clear with no rain.",
                                                    "role": "assistant"
                                                },
                                                "finish_reason": "stop",
                                                "index": 0
                                            }
                                        ],
                                        "created": 1716096936,
                                        "model": "gpt-4-turbo-2024-04-09",
                                        "object": "chat.completion"
                                    };
                                    return [4 /*yield*/, route.fulfill({ json: json })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.locator('#input-block fluent-text-area textarea')];
                case 2:
                    chatInput = _a.sent();
                    return [4 /*yield*/, chatInput.fill('What time is it')];
                case 3:
                    _a.sent();
                    responsePromise = page.waitForResponse(function (response) { return response.url().includes('sendchatwithactions'); });
                    return [4 /*yield*/, page.locator('#big-time-button').click()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, responsePromise];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
generateScreenshots();
