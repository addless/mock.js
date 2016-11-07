describe('Mock', function () {

    it('should mock responses based on header equality', function (done) {
        XMLHttpRequest
            .ifRequestHeader({'x': ['a']})
            .ifRequestHeader({'y': ['b']})
            .setResponseStatus(111);

        var x = new XMLHttpRequest();
        x.open('HEAD', location.href);
        x.setRequestHeader('x', 'a');
        x.onloadend = testResponse;
        x.send();

        function testResponse() {
            expect(this.status).not.toBe(111);
            this.open('HEAD', location.href);
            this.setRequestHeader('y', 'b');
            this.onloadend = testResponse;
            debugger;
            this.send();

            function testResponse() {
                expect(this.status).toBe(111);
                done();
            }
        }
    });
});