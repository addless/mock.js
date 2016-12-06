describe('Mock.js', function () {
    'use strict';

    var mock;
    var prev;
    var xhr;

    forEachTest('base/spec/mock.json', function (done) {
        prev = xhr;
        mock = XMLHttpRequest;
        xhr = new XMLHttpRequest();

        runStep('reuse prev xhr', function () {
            xhr = prev;
        });

        runStep('setup location params', function (hash) {
            location.hash = hash;
        });

        runStep('setup mock', function (key, args) {
            mock = mock[key].apply(mock, args);
        });

        runStep('invoke request', function (key, args) {
            xhr[key].apply(xhr, args);
        });

        xhr.onloadend = function () {
            runStep('check response properties', function (key, val) {
                expect(xhr[key]).toEqual(val);
            });

            runStep('check response headers', function (key, args, val) {
                expect(xhr[key].apply(xhr, args)).toEqual(val);
            });

            done();
        };
    });
});