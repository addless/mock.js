describe('Mock', function () {
    'use strict';

    beforeEach(function () {
        XMLHttpRequest.dropAllMocks();
    });

    it('should mock response based on request header', function (done) {
        var x = new XMLHttpRequest();

        XMLHttpRequest
            .ifRequestHeader({a: '1, 1'})
            .ifRequestHeader({b: /^1$/})
            .setResponseStatus(1)
            .setResponseHeader({c:1})
            .setResponseHeader({c:1, d:1})
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
            .setResponseHeader({c:1})
            .setResponseHeader({c:1, d:1})
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
            .setResponseHeader({c:1})
            .setResponseHeader({c:1, d:1})
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
            .setResponseHeader({c:1})
            .setResponseHeader({c:1, d:1})
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
            .setResponseHeader({c:1})
            .setResponseHeader({c:1, d:1})
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
            .setResponseHeader({c:1})
            .setResponseHeader({c:1, d:1})
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
            .setResponseHeader({c:1})
            .setResponseHeader({c:1, d:1})
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