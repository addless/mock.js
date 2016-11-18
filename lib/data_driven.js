function data_driven(suiteName, dataUrl, fn) {
    window.__karma__.loaded = function () {};
    var x = new XMLHttpRequest();
    x.open('GET', dataUrl);
    x.onload = onload;
    x.send();

    function onload() {
        var jasmineIt = it;
        var jasmineBefore = beforeEach;
        var data = JSON.parse(this.responseText);

        data.forEach(function (testData) {
            try {
                it = function (title, f) {
                    for (var key in testData) {
                        title = title.replace('{' + key + '}', testData[key])
                    }

                    if (f !== undefined) {
                        var testFn = f.length < 2 ?
                            function () {
                                return f.call(this, testData)
                            } :
                            function (done) {
                                return f.call(this, testData, done)
                            }
                    }

                    describe(suiteName, function () {
                        jasmineIt(title, testFn);
                    });
                };

                beforeEach = function (f) {
                    var testFn = f.length < 2 ?
                        function () {
                            return f.call(this, testData);
                        } :
                        function (done) {
                            return f.call(this, testData, done);
                        };

                    jasmineBefore(testFn)
                };

                fn()
            } catch(e) {
                console.error('data_driven error: ', e);
            } finally {
                it = jasmineIt;
                beforeEach = jasmineBefore
            }
        });

        window.__karma__.start();
    }
}