describe('mock.js', function () {

    before(function () {
        driver = dataDriven('base/spec/dataDriven/mock.json');
    });

    driver.it('data driven mock.js', function () {
        // provide driver metadata
        driver.setContextMetadata({
            setupItemsId: 'xhrMockMethods',
            expectationsId: 'expected'
        })

        // provide custom helper function to provide context for test execution
        .setHelperFunc(function helperFunc (lastScope, execute) {
            if(typeof lastScope.x === 'undefined') {
                location.hash = '';
                XMLHttpRequest.dropAllMocks();
                this.x = new XMLHttpRequest();
                this.setRequestHeaderArgs = [];
            } else {
                this.x = lastScope.x;
                this.xhrChain = lastScope.xhrChain;
                this.setRequestHeaderArgs = lastScope.setRequestHeaderArgs;
            }

            var scope = setUpTestScope.apply(this);

            if(typeof execute === 'function') {
                execute(scope);
            }

            return scope;

            function setUpTestScope() {
                var mockFunction = this.fname;
                var mockFunctionArgs = this.fargs;

                if (mockFunction === 'setRequestHeader') {
                    this.setRequestHeaderArgs.push(mockFunctionArgs);
                    return this;
                }

                if (typeof XMLHttpRequest[mockFunction] === 'undefined' || mockFunction === 'setRequestHeader') {
                    return this;
                }

                if (this.xhrChain) {
                    this.xhrChain = this.xhrChain[mockFunction].apply(this.xhrChain, mockFunctionArgs);
                } else {
                    this.xhrChain = XMLHttpRequest[mockFunction].apply(XMLHttpRequest, mockFunctionArgs);
                }

                return this;
            }
        })

        // execute tests
        .executeTests(function executeFn (done) {
            var x = this.x;
            var expectations = this.expectations;
            x.open('GET', 'base/spec/mock.json');
            setRequestHeaders.apply(this);
            x.onload = onload;
            x.send();

            function onload() {
                var expectedValue;
                for(var key in expectations) {
                    expectedValue = expectations[key];

                    switch(key){
                        case 'allResponseHeaders':
                            expect(this.getAllResponseHeaders()).toBe(expectedValue);
                            break;
                        case 'responseBody':
                            expect(this.responseText).toBe(expectedValue);
                            break;
                        case 'responseStatus':
                            expect(this.status).toBe(expectedValue);
                            break;
                        case 'responseHeader':
                            var actual, expected;
                            for(var h in expectedValue){
                                actual = this.getResponseHeader(h);
                                expected = expectedValue[h];
                                expect(actual).toBe(expected);
                            }
                            break;
                        default:
                            break;
                    }
                }
                done();
            }

            function setRequestHeaders() {
                var x = this.x;
                var setRequestHeaderArgs = this.setRequestHeaderArgs;
                var fargs;

                for(var i = 0; i < setRequestHeaderArgs.length; i++) {
                    fargs = driver.parse(setRequestHeaderArgs[i]);
                    x.setRequestHeader.apply(x, fargs);
                }
            }
        });
    });
});
