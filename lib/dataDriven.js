function dataDriven(suiteUrlSpecBodyArray, specBody) {
    /*
     * suiteUrlSpecBodyArray is a 2D Array which takes format below:
     * [
     *     [ suiteName1, suiteDataUrlToJsonFile1 ],
     *     [ suiteName2, suiteDataUrlToJsonFile2 ],
     *      ...
     * ]
     */

    var suiteTotal = suiteUrlSpecBodyArray.length;

    if(suiteTotal === 0) {
        return;
    }

    window.__karma__.loaded = function () {
    };

    var suiteIndex, suite, suiteName, dataUrl;
    var suiteCounter = suiteTotal;

    for(suiteIndex = 0; suiteIndex < suiteTotal; suiteIndex++) {
        suite = suiteUrlSpecBodyArray[suiteIndex];
        suiteName = suite[0];
        dataUrl = suite[1];

        kickOffSuite(suiteName, dataUrl, specBody, kickOffCb);
    }

    function kickOffCb() {
        suiteCounter = suiteCounter - 1;
        if(suiteCounter === 0) {
            window.__karma__.start();
        }
    }

    function kickOffSuite(suiteName, dataUrl, fn, cb) {

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
                } catch (e) {
                    console.error('data_driven error: ', e);
                } finally {
                    it = jasmineIt;
                    beforeEach = jasmineBefore
                }
            });

            cb();
        }
    }
}