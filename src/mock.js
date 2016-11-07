var XMLHttpRequest = (function() {
    var _xmlHttpRequest = XMLHttpRequest;
    var overrides = {__proto__: null};
    var idBase = Date.now();

    return Object.defineProperties(NewXMLHttpRequest, {
        ifRequestURL:        {value: addCriteria('responseURL')},
        ifRequestHeader:     {value: addCriteria('_reqHead')},
        ifRequestMethod:     {value: addCriteria('_method')},
        ifRequestBody:       {value: addCriteria('_body')},
        _requisiteCondition: {value: function () {}}
    });

    function NewXMLHttpRequest() {
        var x = new _xmlHttpRequest();

        return {
            getAllResponseHeaders: getAllResponseHeaders,
            getResponseHeader:     getResponseHeader,
            setRequestHeader:      setRequestHeader,
            _resHead:              {__proto__: null},
            _reqHead:              {__proto__: null},
            open:                  open,
            send:                  send,
            onload:                { get: onLoadGetter, set: onLoadSetter },
            __proto__:             x
        };

        function open(method, url, async) {
            x.open(method, url, async);
            this._method = method;
        }

        function onLoadGetter() {
            return x.onload;
        }

        function onLoadSetter(o) {
            return x.onload = o;
        }

        function setRequestHeader(name, value) {
            this._reqHead[name] = this._reqHead[name] || [];
            this._reqHead[name].push(value);
            x.setRequestHeader(name, value);
        }

        function getResponseHeader(name) {
            var k = Object.keys(this._resHead);
            if (k.length < 1) return x.getResponseHeader(name);
            if (k.length > 0) return (this._resHead[name] || []).join(', ');
        }

        function getAllResponseHeaders() {
            var k = Object.keys(this._resHead);
            var r = [];
            var i = -1;

            while (k[++i]) r[i] = k[i] + ':' + this._resHead[k[i]];
            if (r.length < 1) return x.getAllResponseHeaders();
            if (r.length > 0) return r.join('\r\n');

        }

        function send(body) {
            var k = Object.keys(overrides);
            var o = false;
            var i = -1;
            var me = this;

            // TODO: investigate whether we need to call xhr send or simply call onload
            // x.send(body);

            this._body = body;

            setTimeout(function () {
                while (k[++i]) {
                    // TODO: why are we not using triple equals, what type of conditional is going on here?
                    if (o = overrides[k[i]](me)) {
                        break;
                    }
                }
                me.onload();
            });
        }
    }

    function setResponseStatus(code) {
        var o = overrides[this._id];

        overrides[this._id] = function (xhr) {
            o(xhr); // execute previous override
            xhr.responseStatus = code;
            return true;
        };

        return this;
    }

    function setResponseBody(body) {
        var o = overrides[this._id];
        var b = JSON.stringify(body);

        overrides[this._id] = function (xhr) {
            o(xhr); // execute previous override
            xhr.responseText = b;
            return true;
        };

        return this;
    }

    function setResponseHeader(headers) {
        var k = Object.keys(headers);
        var d = overrides[this._id];

        overrides[this._id] = function (xhr) {
            var i = -1;
            d(xhr); // execute previous override
            while (k[++i]) xhr._resHead[k[i]] = headers[k[i]];
            return true;
        };

        return this;
    }

    function addCriteria(key) {
        return function (pattern) {
            var i = this._id || (idBase++).toString(36);
            var d = overrides[i];

            overrides[i] = function (xhr) {
                return isMatch(xhr[key], pattern) && d(xhr);
            };
            
            return {
                setResponseStatus: setResponseStatus,
                setResponseHeader: setResponseHeader,
                setResponseBody:   setResponseBody,
                __proto__:         this,
                _id:               i
            };

            function isMatch(value, pattern) {
                var k;
                var i = -1;

                switch (true) {
                case pattern == null:
                    break;

                default:
                    if (value !== pattern) return false;
                    break;

                case pattern instanceof RegExp:
                    if (!pattern.test(value)) return false;
                    break;

                case value instanceof Object:
                    k = Object.keys(pattern);
                    while (k[++i]) if (!isMatch(value[k[i]], pattern[k[i]])) return false;
                }

                return true;
            }
        }
    }
}());
