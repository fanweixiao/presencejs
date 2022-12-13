function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
var __accessCheck = function(obj, member, msg) {
    if (!member.has(obj)) throw TypeError("Cannot " + msg);
};
var __privateGet = function(obj, member, getter) {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = function(obj, member, value) {
    if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
    _instanceof(member, WeakSet) ? member.add(obj) : member.set(obj, value);
};
var __privateSet = function(obj, member, value, setter) {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    WebTransport: function() {
        return WebTransport;
    },
    default: function() {
        return src_default;
    }
});
module.exports = __toCommonJS(src_exports);
// src/BidirectionalStream.ts
var BidirectionalStream = function BidirectionalStream(ws) {
    "use strict";
    _classCallCheck(this, BidirectionalStream);
    this.writable = null;
    this.readable = null;
    return new Proxy(this, {
        get: function get(_, prop) {
            if (prop === "writable") {
                return new WritableStream({
                    start: function start(_2) {},
                    write: function write(chunk) {
                        return new Promise(function(resolve, reject) {
                            try {
                                ws.send(chunk);
                                resolve();
                            } catch (e) {
                                reject(e);
                            }
                        });
                    },
                    close: function close() {},
                    abort: function abort(_2) {}
                });
            } else if (prop === "readable") {
                return new ReadableStream({
                    start: function start(controller) {
                        var timer = null;
                        var cb = function(ev) {
                            if (timer) {
                                clearTimeout(timer);
                            }
                            controller.enqueue(ev.data);
                            timer = setTimeout(function() {
                                return ws.removeEventListener("message", cb);
                            }, 1e3);
                        };
                        ws.addEventListener("message", cb);
                    },
                    cancel: function cancel() {}
                });
            }
            return void 0;
        }
    });
};
// src/Datagrams.ts
var DataGrams = function DataGrams(ws) {
    "use strict";
    _classCallCheck(this, DataGrams);
    this.writable = null;
    this.readable = null;
    return new Proxy(this, {
        get: function get(_, prop) {
            if (prop === "writable") {
                return new WritableStream({
                    start: function start(_2) {},
                    write: function write(chunk) {
                        return new Promise(function(resolve, reject) {
                            try {
                                ws.send(chunk);
                                resolve();
                            } catch (e) {
                                reject(e);
                            }
                        });
                    },
                    close: function close() {},
                    abort: function abort(_2) {}
                });
            } else if (prop === "readable") {
                return new ReadableStream({
                    start: function start(controller) {
                        var timer = null;
                        var cb = function(ev) {
                            if (timer) {
                                clearTimeout(timer);
                            }
                            controller.enqueue(ev.data);
                        };
                        ws.addEventListener("message", cb);
                    },
                    cancel: function cancel() {}
                });
            }
            return void 0;
        }
    });
};
// src/ReceiveStream.ts
var ReceiveStream = function ReceiveStream(ws) {
    "use strict";
    _classCallCheck(this, ReceiveStream);
    return new ReadableStream({
        start: function start(controller) {
            var timer = null;
            var cb = function(ev) {
                if (timer) {
                    clearTimeout(timer);
                }
                controller.enqueue(new ReadableStream({
                    start: function start(controller2) {
                        controller2.enqueue(ev.data);
                    }
                }));
                timer = setTimeout(function() {
                    return ws.removeEventListener("message", cb);
                }, 1e3);
            };
            ws.addEventListener("message", cb);
        },
        cancel: function cancel() {}
    });
};
// src/SendStream.ts
var SendStream = function SendStream(ws) {
    "use strict";
    _classCallCheck(this, SendStream);
    return new Proxy(this, {
        get: function get(_, prop) {
            if (prop === "writable") {
                return new WritableStream({
                    start: function start(_2) {},
                    write: function write(chunk) {
                        return new Promise(function(resolve, reject) {
                            try {
                                ws.send(chunk);
                                resolve();
                            } catch (e) {
                                reject(e);
                            }
                        });
                    },
                    close: function close() {},
                    abort: function abort(_2) {}
                });
            }
            return void 0;
        }
    });
};
// src/index.ts
var _ws, _connErr;
var WebTransport = /*#__PURE__*/ function() {
    "use strict";
    function WebTransport(url) {
        var _this = this;
        _classCallCheck(this, WebTransport);
        this.url = url;
        __privateAdd(this, _ws, null);
        __privateAdd(this, _connErr, void 0);
        this.datagrams = null;
        this.closed = new Promise(function(resolve, reject) {
            resolve(null);
            reject();
        });
        this.ready = new Promise(function(resolve, reject) {
            url = url.replace(/^http/, "ws");
            __privateSet(_this, _ws, new WebSocket(url));
            __privateGet(_this, _ws).binaryType = "arraybuffer";
            __privateGet(_this, _ws).addEventListener("open", function() {
                resolve(null);
            }), __privateGet(_this, _ws).addEventListener("error", function(err) {
                __privateSet(_this, _connErr, err);
                reject(err);
            }), __privateGet(_this, _ws).addEventListener("close", function() {
                _this.closed = new Promise(function(resolve2, reject2) {
                    resolve2(null);
                    reject2();
                });
                reject(__privateGet(_this, _connErr));
            }), _this.datagrams = new DataGrams(__privateGet(_this, _ws));
        });
    }
    _createClass(WebTransport, [
        {
            key: "createSendStream",
            value: function createSendStream() {
                if (!__privateGet(this, _ws)) throw Error("WebTransport is closed");
                return new SendStream(__privateGet(this, _ws));
            }
        },
        {
            key: "receiveStream",
            value: function receiveStream() {
                if (!__privateGet(this, _ws)) throw Error("WebTransport is closed");
                return new ReceiveStream(__privateGet(this, _ws));
            }
        },
        {
            key: "createBidirectionalStream",
            value: function createBidirectionalStream() {
                var _this = this;
                return new Promise(function(resolve, reject) {
                    if (!__privateGet(_this, _ws)) return reject(Error("WebTransport is closed"));
                    resolve(new BidirectionalStream(__privateGet(_this, _ws)));
                });
            }
        },
        {
            key: "receiveBidrectionalStreams",
            value: function receiveBidrectionalStreams() {
                if (!__privateGet(this, _ws)) throw Error("WebTransport is closed");
                return new BidirectionalStream(__privateGet(this, _ws));
            }
        }
    ]);
    return WebTransport;
}();
_ws = new WeakMap();
_connErr = new WeakMap();
if (typeof window !== "undefined") {
    if (typeof window.WebTransport === "undefined") {
        window.WebTransport = WebTransport;
    }
}
var src_default = WebTransport;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    WebTransport: WebTransport
});
//# sourceMappingURL=index.js.map