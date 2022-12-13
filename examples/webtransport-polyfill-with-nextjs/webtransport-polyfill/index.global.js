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
(function() {
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
    // src/BidirectionalStream.ts
    var BidirectionalStream = function BidirectionalStream(ws) {
        "use strict";
        _classCallCheck(this, BidirectionalStream);
        return new Proxy(this, {
            get: function get(target, prop, receiver) {
                if (prop === "writable") {
                    return new WritableStream({
                        start: function start(controller) {},
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
                        abort: function abort(reason) {}
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
    // src/DataGrams.ts
    var DataGrams = function DataGrams(ws) {
        "use strict";
        _classCallCheck(this, DataGrams);
        return new Proxy(this, {
            get: function get(target, prop, receiver) {
                if (prop === "writable") {
                    return new WritableStream({
                        start: function start(controller) {},
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
                        abort: function abort(reason) {}
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
            get: function get(target, prop, receiver) {
                if (prop === "writable") {
                    return new WritableStream({
                        start: function start(controller) {},
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
                        abort: function abort(reason) {}
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
            __privateAdd(this, _ws, void 0);
            __privateAdd(this, _connErr, void 0);
            this.closed = new Promise(function(resolve, reject) {});
            this.ready = new Promise(function(resolve, reject) {
                url = url.replace(/^http/, "ws");
                __privateSet(_this, _ws, new WebSocket(url));
                __privateGet(_this, _ws).addEventListener("open", function() {
                    resolve(null);
                }), __privateGet(_this, _ws).addEventListener("error", function(err) {
                    __privateSet(_this, _connErr, err);
                    reject(err);
                }), __privateGet(_this, _ws).addEventListener("close", function() {
                    _this.closed = new Promise(function(resolve2, reject2) {});
                    reject(__privateGet(_this, _connErr));
                }), _this.datagrams = new DataGrams(__privateGet(_this, _ws));
            });
        }
        _createClass(WebTransport, [
            {
                key: "createSendStream",
                value: function createSendStream() {
                    return new SendStream(__privateGet(this, _ws));
                }
            },
            {
                key: "receiveStream",
                value: function receiveStream() {
                    return new ReceiveStream(__privateGet(this, _ws));
                }
            },
            {
                key: "createBidirectionalStream",
                value: function createBidirectionalStream() {
                    var _this = this;
                    return new Promise(function(resolve, reject) {
                        resolve(new BidirectionalStream(__privateGet(_this, _ws)));
                    });
                }
            },
            {
                key: "receiveBidrectionalStreams",
                value: function receiveBidrectionalStreams() {
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
})();
//# sourceMappingURL=index.global.js.map