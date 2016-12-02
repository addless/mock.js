describe('Mock.js', function () {
    'use strict';

    forEachTest('base/spec/mock.json', function (done) {
        var xhr = new XMLHttpRequest();
        var mock = XMLHttpRequest;

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