function specBody() {

    beforeEach(function () {
        location.hash = '';
        XMLHttpRequest.dropAllMocks();
    });

    it('should {itShould}', function (ctx, done) {
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
}

function setXMLHttpRequestContext(ctx) {
    var xhrChain, mockObj, mockFunction, mockFunctionArgs;

    for (var i = 0; i < ctx.xhrMockMethods.length; i++) {
        mockObj = ctx.xhrMockMethods[i];
        mockFunction = Object.keys(mockObj)[0];
        mockFunctionArgs = mockObj[mockFunction];

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

function setRequestHeaders(x, ctx) {
    var mockObj, mockFunction, mockFunctionArgs;
    for (var i = 0; i < ctx.xhrMockMethods.length; i++) {
        mockObj = ctx.xhrMockMethods[i];
        mockFunction = Object.keys(mockObj)[0];

        if (mockFunction === 'setRequestHeader') {
            mockFunctionArgs = mockObj[mockFunction];
            x.setRequestHeader.apply(x, mockFunctionArgs);
        }
    }

}