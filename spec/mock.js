describe('Mock', function () {

    it('should mock responses based on header equality', function (done) {
        XMLHttpRequest
            .ifRequestHeader({'x': 'a, b'})
            .ifRequestHeader({'y': 'c'})
            .setResponseStatus(111);

        var x = new XMLHttpRequest();
        x.open('HEAD', location.href);
        x.setRequestHeader('x', 'a');
        x.setRequestHeader('x', 'b');
        x.onloadend = testResponse;
        x.send();

        function testResponse() {
            expect(this.status).not.toBe(111);
            this.open('HEAD', location.href);
            this.setRequestHeader('y', 'c');
            this.onloadend = testResponse;
            this.send();

            function testResponse() {
                expect(this.status).toBe(111);
                done();
            }
        }
    });
});