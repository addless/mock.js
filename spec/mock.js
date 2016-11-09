describe('Mock', function () {
    'use strict';

    describe('Data Driven', function () {
        function setXMLHttpRequestContext(ctx) {
            var xhrChain, ctxKey, mockFunction;
            for (ctxKey in ctx) {
                mockFunction = ctxKey.replace(/_/g, '');

                if (typeof XMLHttpRequest[mockFunction] === 'undefined') {
                    continue;
                }

                if (typeof xhrChain === 'undefined') {
                    xhrChain = XMLHttpRequest[mockFunction].call(XMLHttpRequest, ctx[ctxKey]);
                } else {
                    xhrChain = xhrChain[mockFunction].call(xhrChain, ctx[ctxKey]);
                }
            }
        }

        function setInstanceXHRSendOptions(x, sendOptions) {
            var key, requestArg;
            
            for (key in sendOptions.setRequestHeaders) {
                requestArg = sendOptions.setRequestHeaders[key];
                x.setRequestHeader.apply(x, requestArg);
            }
        }

        data_driven([
            // TODO: evaluate syntactic variants of formatting the test data
            // [
            //     {ifRequestHeader: {a: '1, 1'}},
            //     {ifRequestHeader: {a: '1, 1'}},
            //     {ifRequestHeader: {a: '1, 1'}}
            // ],
            // [
            //     'ifRequestHeader', {a: '1, 1'},
            //     'ifRequestHeader', {a: '1, 1'},
            //     'ifRequestHeader', {a: '1, 1'}
            // ],
            {
                ifRequestHeader: {a: '1, 1'},
                setResponseStatus: 1,
                setResponseHeader: {c: 1},
                _setResponseHeader: {c: 1, d: 1},
                __setResponseHeader: {c: 1, d: 1, e: 5},
                setResponseBody: {mock: ['body']},
                sendOptions: {
                    setRequestHeaders: [
                        ['a', 1],
                        ['a', 1],
                        ['b', 1]
                    ]
                },

                expected: {
                    responseBody: '{"mock":["body"]}',
                    responseHeader: {
                        c: '1, 1, 1',
                        d: '1, 1',
                        e: '5'
                    },
                    allResponseHeaders : 'c:1, 1, 1\r\nd:1, 1\r\ne:5'
                }
            },
            {
                ifRequestHeader: {a: '1, 6'},
                _ifRequestHeader: {b: /33$/},
                setResponseStatus: 1,
                setResponseHeader: {a: 1},
                _setResponseHeader: {c: 1, d: 0},
                __setResponseHeader: {c: 21, d: 1, e: 5},
                setResponseBody: {mock: ['body2']},
                sendOptions: {
                    setRequestHeaders: [
                        ['a', 1],
                        ['a', 6],
                        ['b', 133]
                    ]
                },

                expected: {
                    responseBody: '{"mock":["body2"]}',
                    responseHeader: {
                        a: '1',
                        c: '1, 21',
                        d: '0, 1',
                        e: '5'
                    },
                    allResponseHeaders : 'a:1\r\nc:1, 21\r\nd:0, 1\r\ne:5'
                }
            }
        ], function () {
            beforeEach(function () {
                XMLHttpRequest.dropAllMocks();
            });

            it('should mock response based on request header matching for equality', function (ctx, done) {
                var x = new XMLHttpRequest();

                // set send option defaults for method and url
                ctx.openMethod = typeof ctx.openMethod === 'undefined' ? 'GET' : ctx.openMethod;
                ctx.openUrl = typeof ctx.openUrl === 'undefined' ? 'base/spec/mock.json' : ctx.openUrl;

                setXMLHttpRequestContext(ctx);

                x.open('GET', 'base/spec/mock.json');

                x.onload = function () {
                    var responseHeader, responseHeaderVal;

                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.status).toBe(200);

                    for(responseHeader in ctx.expected.responseHeader) {
                        responseHeaderVal = ctx.expected.responseHeader[responseHeader];
                        expect(this.getResponseHeader(responseHeader)).toBe(null);
                    }

                    this.open(ctx.openMethod, ctx.openUrl);
                    setInstanceXHRSendOptions(this, ctx.sendOptions);
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe(ctx.expected.allResponseHeaders);
                        expect(this.responseText).toBe(ctx.expected.responseBody);
                        expect(this.status).toBe(1);

                        for(responseHeader in ctx.expected.responseHeader) {
                            responseHeaderVal = ctx.expected.responseHeader[responseHeader];
                            expect(this.getResponseHeader(responseHeader)).toBe(responseHeaderVal);
                        }

                        done();
                    }
                };

                x.send();
            });
        });
    });


    describe('Non Data Driven', function () {
        beforeEach(function () {
            XMLHttpRequest.dropAllMocks();
        });

        it('should mock response based on request header', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestHeader({a: '1, 1'})
                .ifRequestHeader({b: /^1$/})
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.setRequestHeader('a', 1);
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json');
                    this.setRequestHeader('a', 1);
                    this.setRequestHeader('a', 1);
                    this.setRequestHeader('b', 1);
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request URL pattern', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestURL(/1$/)
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json?1');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request URL equality', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestURL('1')
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.getAllResponseHeaders()).not.toBe('c:3, 3\r\nd:3');
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', '1');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request method pattern', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestMethod(/^1$/)
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('1', 'base/spec/mock.json');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request method equality', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestMethod('1')
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('1', 'base/spec/mock.json');
                    this.onload = onload;
                    this.send();

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request body JSON', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestBody({a: 1, b: /^1$/})
                .ifRequestBody({c: [1, /^1$/]})
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.onload = onload;
                x.open('GET', 'base/spec/mock.json');
                x.send(JSON.stringify({a: 1, b: 1}));

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.onload = onload;
                    this.open('GET', 'base/spec/mock.json');
                    this.send(JSON.stringify({a: 1, b: 1, c: [1, 1]}));

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });

        it('should mock response based on request body string', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifRequestBody('1')
                .setResponseStatus(1)
                .setResponseHeader({c: 1})
                .setResponseHeader({c: 1, d: 1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.onload = onload;
                x.open('GET', 'base/spec/mock.json');
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json');
                    this.onload = onload;
                    this.send(1);

                    function onload() {
                        expect(this.getAllResponseHeaders()).toBe('c:1, 1\r\nd:1');
                        expect(this.responseText).toBe('{"mock":["body"]}');
                        expect(this.getResponseHeader('c')).toBe('1, 1');
                        expect(this.getResponseHeader('d')).toBe('1');
                        expect(this.getResponseHeader('e')).toBe(null);
                        expect(this.status).toBe(1);
                        done();
                    }
                }
            }());
        });
    });


});