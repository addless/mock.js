describe('Mock.js', function () {
    'use strict';

    var mock;
    var prev;
    var xhr;

    forEachTest('base/spec/mock.json', function () {
        prev = xhr;
        mock = XMLHttpRequest;
        xhr = new XMLHttpRequest();

        runStep('reuse prev xhr', function () {
            xhr = prev;
        });

        runStep('setup location params', function (hash) {
            location.hash = hash;
        });

        runStep('setup request', function (key, args) {
            xhr[key].apply(xhr, args);
        });

        runStep('setup mock', function (key, args) {
            mock = mock[key].apply(mock, args);
        });

        runAsyncStep('send request', function (args) {
            xhr.onloadend = endAsyncStep;
            xhr.send.apply(xhr, args);
        });

        runStep('check response properties', function (key, val) {
            expect(xhr[key]).toEqual(val);
        });

        runStep('check response headers', function (key, args, val) {
            expect(xhr[key].apply(xhr, args)).toEqual(val);
        });
    });
});