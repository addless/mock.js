describe('Mock', function () {

    it('should mock responses based on header equality', function (done) {
        var x = new XMLHttpRequest();

        XMLHttpRequest
            .ifRequestHeader({'x': 'y'})
            .setResponseStatus(111);

        x.open('GET', '…');
        x.setRequestHeader('x', 'y');
        x.onload = onload;
        x.send();

        function onload() {
            expect(x.responseStatus).toBe(111);
            done();
        }
    });

    it('should mock responses based on header pattern', function (done) {
        var x = new XMLHttpRequest();

        XMLHttpRequest
            .ifRequestHeader({'x': /^y$/})
            .setResponseStatus(111);

        x.open('GET', '…');
        x.setRequestHeader('x', 'y');
        x.onload = onload;
        x.send();

        function onload() {
            expect(x.responseStatus).toBe(111);
            done();
        }
    });

    it('should mock responses based on url equality', function (done) {
        var x = new XMLHttpRequest();
        var u = 'http://foo.bar';

        XMLHttpRequest
            .ifRequestURL(u)
            .setResponseStatus(111);

        x.open('GET', u);
        x.setRequestHeader('x', 'y');
        x.onload = onload;
        x.send();

        function onload() {
            expect(x.responseStatus).toBe(111);
            done();
        }
    });

    it('should mock responses based on url pattern', function (done) {
        var x = new XMLHttpRequest();
        var u = 'http://foo.bar';

        XMLHttpRequest
            .ifRequestURL(/^http:/)
            .setResponseStatus(111);

        x.open('GET', u);
        x.setRequestHeader('x', 'y');
        x.onload = onload;
        x.send();

        function onload() {
            expect(x.responseStatus).toBe(111);
            done();
        }
    });

    it('should mock body', function (done) {
        var x = new XMLHttpRequest();
        var b = {foo: 1};

        XMLHttpRequest
            .ifRequestURL('foo')
            .setResponseBody(b);

        x.open('GET', 'foo');
        x.setRequestHeader('x', 'y');
        x.onload = onload;
        x.send();

        function onload() {
            expect(JSON.stringify(x.responseText)).toBe(b);
            done();
        }
    });
});