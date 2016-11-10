function data_driven(data, fn) {
    var jasmineIt = it;
    var jasmineBefore = beforeEach;

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

                jasmineIt(title, testFn);
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
        } finally {
            it = jasmineIt;
            beforeEach = jasmineBefore
        }
    });
}