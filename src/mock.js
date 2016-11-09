(function() {
    'use strict';

    var instructions = {__proto__: null};
    var unique = Date.now();

    Object.defineProperties(XMLHttpRequest.prototype, {
        _getAllResHeaders: {value: XMLHttpRequest.prototype.getAllResponseHeaders},
        _getResHeader:     {value: XMLHttpRequest.prototype.getResponseHeader},
        _setReqHeader:     {value: XMLHttpRequest.prototype.setRequestHeader},
        _open:             {value: XMLHttpRequest.prototype.open},
        _send:             {value: XMLHttpRequest.prototype.send},
        _mockURL:          {value: location.href},

        responseText:          defineProxy(XMLHttpRequest.prototype, 'responseText'),
        status:                defineProxy(XMLHttpRequest.prototype, 'status'),
        getAllResponseHeaders: {value: getAllResponseHeaders},
        getResponseHeader:     {value: getResponseHeader},
        setRequestHeader:      {value: setRequestHeader},
        open:                  {value: open},
        send:                  {value: send}
    });

    Object.defineProperties(XMLHttpRequest, {
        ifRequestHeader:     {value: addMockCriteria('_reqHead')},
        ifLocationParam:     {value: addMockCriteria('_params')},
        ifRequestMethod:     {value: addMockCriteria('_method')},
        ifRequestBody:       {value: addMockCriteria('_body')},
        ifRequestURL:        {value: addMockCriteria('_url')},
        setResponseStatus:   {value: setResponseStatus},
        setResponseHeader:   {value: setResponseHeader},
        setResponseBody:     {value: setResponseBody},
        dropAllMocks:        {value: dropAllMocks}
    });

    function dropAllMocks() {
        instructions = {__proto__: null};
    }
    
    function open(method, url, async) {
        this._open.apply(this, arguments);
        this._reqHead = {__proto__: null};
        this._resHead = {__proto__: null};
        this._params = {__proto__: null};
        this._method = method;
        this._body = null;
        this._url = url;
    }

    function send(body) {
        var r = /(\w+)=([^&]*)/g; // match <key>=<value> pattern in url
        var n;

        while (n = r.exec(location.search)) this._params[n[1]] = n[2];
        while (n = r.exec(location.hash)) this._params[n[1]] = n[2];

        try { this._body = JSON.parse(body) }
        catch (_) { }

        if (typeof this._body !== 'object') this._body = String(body);
        for (n in instructions) if (instructions[n](this)) break;
        this._send.apply(this, arguments);
    }

    function setRequestHeader(key, value) {
        setHeader(this._reqHead, key, value);
        this._setReqHeader.apply(this, arguments);
    }

    function setHeader(head, key, value) {
        var v = head[key] || '';
        if (v === '') head[key] = v + value;
        if (v !== '') head[key] = v + ', ' + value;
    }

    function getResponseHeader(name) {
        var k = Object.keys(this._resHead);

        if (k.length === 0) return this._getResHeader.apply(this, arguments);
        if (k.length !== 0) return this._resHead[name] || null;
    }

    function getAllResponseHeaders() {
        var k = Object.keys(this._resHead);
        var r = [];
        var i = -1;

        if (k.length < 1) return this._getAllResHeaders.apply(this, arguments);
        while (k[++i]) r[i] = k[i] + ':' + this._resHead[k[i]];
        if (k.length > 0) return r.join('\r\n');
    }

    function setResponseStatus(code) {
        var test = instructions[this._id];

        instructions[this._id] = setStatus;
        return this;

        function setStatus(xhr) {
            if (test(xhr) !== true) return;
            xhr._status = code;
            return true;
        }
    }

    function setResponseBody(body) {
        var test = instructions[this._id];

        if (typeof body !== 'string') body = JSON.stringify(body);
        instructions[this._id] = setBody;
        return this;

        function setBody(xhr) {
            if (test(xhr) !== true) return;
            xhr._responseText = body;
            return true;
        }
    }

    function setResponseHeader(headers) {
        var k = Object.keys(headers);
        var test = instructions[this._id];

        instructions[this._id] = setHeaders;
        return this;

        function setHeaders(xhr) {
            var i = -1;
            if (test(xhr) !== true) return;
            while (k[++i]) setHeader(xhr._resHead, k[i], headers[k[i]]);
            return true;
        }
    }

    function defineProxy(proto, key) {
        var d = Object.getOwnPropertyDescriptor(proto, key);
        var k = '_' + key;

        return {
            get: getter,
            set: setter
        };

        function getter() {
            if (this[k] != null) return this[k];
            if (d.get == null) return this[key];
            if (d.get != null) return d.get.call(this);
        }

        function setter(value) {
            if (d.set == null) this[k] = value;
            if (d.set != null) d.set.call(this, value);
        }
    }

    function addMockCriteria(key) {
        return function (pattern) {
            var i = this._id || (unique++).toString(36);
            var f = instructions[i] || sendMockRequest;

            instructions[i] = testRequest.bind(null, f, key, pattern);
            return {__proto__: this, _id: i};
        };

        function sendMockRequest(xhr) {
            xhr._open('HEAD', xhr._mockURL);
            return true;
        }

        function testRequest(next, key, pattern, xhr) {
            return isMatch(xhr[key], pattern) && next(xhr);
        }

        function isMatch(value, pattern) {
            var k;
            var i = -1;

            switch (true) {
            case value === pattern:
                break;

            case value == null:
            case pattern == null:
                return false;

            default:
                if (value !== pattern) return false;
                break;

            case pattern instanceof RegExp:
                if (!pattern.test(value)) return false;
                break;

            case typeof value === 'object':
                k = Object.keys(pattern);
                while (k[++i]) if (!isMatch(value[k[i]], pattern[k[i]])) return false;
            }

            return true;
        }
    }
}());
