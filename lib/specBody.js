function specBody() {
    var dataParser = new DataParser();
    it('should {itShould}', function (ctx, done) {
        beforeEachDataDrivenSpec(dataParser);

        //location.hash = ''; //TODO: Find out why this blocks webkit browsers from connecting with karma

        XMLHttpRequest.dropAllMocks();

        var x = new XMLHttpRequest();
        // set send option defaults for method and url
        ctx.openMethod = typeof ctx.openMethod === 'undefined' ? 'GET' : ctx.openMethod;
        ctx.openUrl = typeof ctx.openUrl === 'undefined' ? 'base/spec/mock.json' : ctx.openUrl;

        setXMLHttpRequestContext(ctx);

        x.open(ctx.openMethod, ctx.openUrl);
        setRequestHeaders(x, ctx);
        x.onload = onload;
        x.send();

        function onload() {
            if (typeof ctx.expected.allResponseHeaders !== 'undefined') {
                expect(this.getAllResponseHeaders()).toBe(ctx.expected.allResponseHeaders);
            }

            expect(this.responseText).toBe(ctx.expected.responseBody);

            if (typeof ctx.expected.responseStatus !== 'undefined') {
                expect(this.status).toBe(ctx.expected.responseStatus);
            }

            var responseHeader, responseHeaderVal;
            
            for (responseHeader in ctx.expected.responseHeader) {
                responseHeaderVal = ctx.expected.responseHeader[responseHeader];
                expect(this.getResponseHeader(responseHeader)).toBe(responseHeaderVal);
            }

            done();
        }
    });
    
    function setXMLHttpRequestContext(ctx, dataParser) {
        var xhrChain, mockObj, mockFunction, mockFunctionArgs;

        for (var i = 0; i < ctx.xhrMockMethods.length; i++) {
            mockObj = ctx.xhrMockMethods[i];
            mockFunction = Object.keys(mockObj)[0];
            mockFunctionArgs = dataParser.parse(mockObj[mockFunction]);

            if (typeof XMLHttpRequest[mockFunction] === 'undefined' || mockFunction === 'setRequestHeader') {
                continue;
            }

            if (typeof xhrChain === 'undefined') {
                xhrChain = XMLHttpRequest[mockFunction].apply(XMLHttpRequest, mockFunctionArgs);
            } else {
                xhrChain = xhrChain[mockFunction].apply(xhrChain, mockFunctionArgs);
            }
        }
    }

    function setRequestHeaders(x, ctx, dataParser) {
        var mockObj, mockFunction, mockFunctionArgs;
        for (var i = 0; i < ctx.xhrMockMethods.length; i++) {
            mockObj = ctx.xhrMockMethods[i];
            mockFunction = Object.keys(mockObj)[0];

            if (mockFunction === 'setRequestHeader') {
                mockFunctionArgs = dataParser.parse(mockObj[mockFunction]);
                x.setRequestHeader.apply(x, mockFunctionArgs);
            }
        }
    }

    function beforeEachDataDrivenSpec (dataParser) {
        dataParser.parserVariables = {};
    }

    function DataParser () {
        this.parserVariables = {};
    }

    DataParser.prototype.interpolate = function (rawString, parserVariableKey) {
        return rawString.replace(new RegExp('{{' + parserVariableKey + '}}', 'g'), parserVariables[parserVariableKey]);
    };

    DataParser.prototype.convertRegex = function (rawString) {
        var match = rawString.match(/^\$.+}$/g);
        if (match === null) {
            return rawString;
        }

        // TODO: this will not work if the raw Regex in the JSON has options, for instance the case insensitive ex: /FS/i
        return rawString.slice(0, -2).replace('${/', '');
    };

    DataParser.prototype.parse = function (data) {
        var parserVariables = this.parserVariables;
        if(typeof data === 'undefined') {
            return;
        }

        if(Array.isArray(data)) {
            var parsedData = [];

            for(var i = 0; i < data.length; i++) {
                if(typeof data[i] === 'string') {
                    parsedData.push(parseString.call(this, data[i]));
                } else {
                    parsedData.push(data[i]);
                }
            }

            return parsedData;
        }

        return parseString.call(this, data);

        function parseString(dataString) {
            var parsed = dataString;

            if(typeof dataString === 'undefined') {
                console.error('undefined dataString passed to #parseString');
            }

            for (var i in parserVariables) {
                parsed = this.interpolate(parsed, i);
            }

            parsed = this.convertRegex(parsed);

            return parsed;
        }
    };
}