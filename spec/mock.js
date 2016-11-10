describe('Mock', function () {
    'use strict';

    describe('Data Driven', function () {

        function setXMLHttpRequestContext(ctx) {
            var xhrChain, mockObj, mockFunction, mockFunctionArgs;

            for (var i = 0; i < ctx.xhrMockMethods.length; i++) {
                mockObj = ctx.xhrMockMethods[i];
                mockFunction = Object.keys(mockObj)[0];
                mockFunctionArgs = mockObj[mockFunction];

                if (typeof XMLHttpRequest[mockFunction] === 'undefined') {
                    continue;
                }

                if (typeof xhrChain === 'undefined') {
                    xhrChain = XMLHttpRequest[mockFunction].apply(XMLHttpRequest, mockFunctionArgs);
                } else {
                    xhrChain = xhrChain[mockFunction].apply(xhrChain, mockFunctionArgs);
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
            {
                itShould: "match request header on equality",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 1'}]  },
                    { setResponseBody: [{mock: ['body']}]  }
                ],
                sendOptions: {
                    setRequestHeaders: [
                        ['a', 1],
                        ['a', 1]
                    ]
                },
                expected: {
                    responseBody: '{"mock":["body"]}'
                }
            },
            {
                itShould: "match request headers using a regex pattern and an equality",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 6'}]  },
                    { ifRequestHeader: [{b: /33$/}]  },
                    { setResponseBody: [{mock: ['body2']}]  }
                ],
                sendOptions: {
                    setRequestHeaders: [
                        ['a', 1],
                        ['a', 6],
                        ['b', 133]
                    ]
                },
                expected: {
                    responseBody: '{"mock":["body2"]}'
                }
            },
            {
                itShould: "match request header set with multiple keys",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 1', b: 'multiple', c: 'd'}]  },
                    { setResponseBody: [{mock: ['body3']}]  }
                ],
                sendOptions: {
                    setRequestHeaders: [
                        ['a', 1],
                        ['a', 1],
                        ['b', 'multiple'],
                        ['c', 'd']
                    ]
                },
                expected: {
                    responseBody: '{"mock":["body3"]}'
                }
            },
            {
                itShould: "match the response status",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 1'}]  },
                    { setResponseStatus: [400]  },
                    { setResponseBody: [{mock: ['body3']}]  }
                ],
                sendOptions: {
                    setRequestHeaders: [
                        ['a', 1],
                        ['a', 1]
                    ]
                },
                expected: {
                    responseBody: '{"mock":["body3"]}',
                    responseStatus: 400
                }
            },
            {
                itShould: "set response headers based on mock input data",
                xhrMockMethods: [
                    { ifRequestHeader: [{a: '1, 1'}]  },
                    { setResponseHeader: [{c: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1}]  },
                    { setResponseHeader: [{c: 1, d: 1, e: 5}]  },
                    { setResponseBody: [{mock: ['body3']}]  }
                ],
                sendOptions: {
                    setRequestHeaders: [
                        ['a', 1],
                        ['a', 1]
                    ]
                },
                expected: {
                    responseBody: '{"mock":["body3"]}',
                    responseHeader: {
                        c: '1, 1, 1',
                        d: '1, 1',
                        e: '5'
                    },
                    allResponseHeaders : 'c:1, 1, 1\r\nd:1, 1\r\ne:5'
                }
            }

        ], function () {
            beforeEach(function () {
                XMLHttpRequest.dropAllMocks();
            });

            it('should {itShould}', function (ctx, done) {
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
                        if(typeof ctx.expected.allResponseHeaders !== 'undefined') {
                            expect(this.getAllResponseHeaders()).toBe(ctx.expected.allResponseHeaders);
                        }

                        expect(this.responseText).toBe(ctx.expected.responseBody);

                        if(typeof ctx.expected.responseStatus !== 'undefined') {
                            expect(this.status).toBe(ctx.expected.responseStatus);
                        }

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
            x.open('GET', 'base/spec/mock.json');
            x.onload = onload;
            x.send();

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

        it('should mock response based on location params', function (done) {
            var x = new XMLHttpRequest();

            XMLHttpRequest
                .ifLocationParam({a: '1', b: '1'})
                .ifLocationParam({c: /^1$/})
                .setResponseStatus(1)
                .setResponseHeader({c:1})
                .setResponseHeader({c:1, d:1})
                .setResponseBody({mock: ['body']});

            (function () {
                x.open('GET', 'base/spec/mock.json');
                location.hash = 'a=1&b=1';
                x.onload = onload;
                x.send();

                function onload() {
                    expect(this.responseText).toBe('{"mock":"json"}');
                    expect(this.getResponseHeader('c')).toBe(null);
                    expect(this.getResponseHeader('d')).toBe(null);
                    expect(this.getResponseHeader('e')).toBe(null);
                    expect(this.status).toBe(200);

                    this.open('GET', 'base/spec/mock.json');
                    location.hash = 'a=1&b=1&c=1';
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
    });
});