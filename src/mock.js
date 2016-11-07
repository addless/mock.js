var XMLHttpRequest = (function() {
    'use strict';

    var proto = XMLHttpRequest.prototype;
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

        return Object.create(x, {
            getAllResponseHeaders: {value: getAllResponseHeaders},
            getResponseHeader:     {value: getResponseHeader},
            setRequestHeader:      {value: setRequestHeader},
            _resHead:              {value: {__proto__: null}},
            _reqHead:              {value: {__proto__: null}},
            onloadstart:           setListener('onloadstart'),
            onprogress:            setListener('onprogress'),
            ontimeout:             setListener('ontimeout'),
            onloadend:             setListener('onloadend'),
            onabort:               setListener('onabort'),
            onerror:               setListener('onerror'),
            onload:                setListener('onload'),
            status:                setListener('status'),
            open:                  {value: open},
            send:                  {value: send}
        });

        function setListener(key) {
            var k = '_' + key;
            return {get: get, set: set};
            function get() { return this[k] != null ? this[k] : x[key]; }
            function set(func) { return this[k] = x[key] = func.bind(this); }
        }

        function open(method, url, async) {
            x.open.apply(x, arguments);
            this._method = method;
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

            this._body = body;
            while (k[++i]) if (o = overrides[k[i]](this)) break;
            x.send(body);
        }
    }

    function setResponseStatus(code) {
        var o = overrides[this._id];

        overrides[this._id] = override;
        this.__proto__ = null;
        return this;

        function override(xhr) {
            if (o(xhr) !== true) return;
            xhr._status = code;
            return true;
        }
    }

    function setResponseBody(body) {
        var o = overrides[this._id];
        var b = JSON.stringify(body);

        overrides[this._id] = override;
        this.__proto__ = null;
        return this;

        function override (xhr) {
            if (o(xhr) !== true) return;
            xhr.responseText = b;
            return true;
        }
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

        this.__proto__ = null;
        return this;
    }

    function addCriteria(key) {
        return function (pattern) {
            var i = this._id || (idBase++).toString(36);
            var d = overrides[i] || function () {};

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

                case pattern instanceof RegExp:
                    if (!pattern.test(value)) return false;
                    break;

                case typeof value !== 'object':
                    if (value !== pattern) return false;
                    break;

                default:
                    k = Object.keys(pattern);
                    while (k[++i]) if (!isMatch(value[k[i]], pattern[k[i]])) return false;
                }

                return true;
            }
        }
    }
}());
