describe('Mock.js', function () {
    'use strict';

    var times;
    var mock;
    var prev;
    var xhr;

    forEachTest('base/spec/mock.json', function () {
        prev = xhr;
        times = {};
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

        runStep("register event listener via 'on' handler", function (key) {
            xhr[key] = recordEventOccurrence.bind(xhr, key);
            times[key] = performance.now();
        });

        runStep("register event listener via 'addEventListener'", function (key) {
            xhr.addEventListener(key, recordEventOccurrence.bind(xhr, key));
            times[key] = performance.now();
        });

        runAsyncStep("send request", function (args) {
            xhr.addEventListener('loadend', endAsyncStep);
            xhr.send.apply(xhr, args);
        });

        runStep('setup mock', function (key, args) {
            mock = mock[key].apply(mock, args);
        });

        runStep('check response properties', function (key, val) {
            expect(xhr[key]).toEqual(val);
        });

        runStep('check response headers', function (key, args, val) {
            expect(xhr[key].apply(xhr, args)).toEqual(val);
        });

        runStep('check response time', function (key, min, max) {
            expect(times[key]).toBeGreaterThan(min);
            expect(times[key]).toBeLessThan(max);
        });

        function recordEventOccurrence(key) {
            times[key] = performance.now() - times[key];
        }
    });
});