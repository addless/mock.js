function DataParser () {
    this.parserVariables = {};
}

DataParser.prototype.interpolate = function (rawString, parserVariableKey) {
    return rawString.replace(new RegExp('{{' + parserVariableKey + '}}', 'g'), parserVariables[parserVariableKey]);
};

DataParser.prototype.convertRegex = function (rawString) {
    var match = rawString.match(/^\$.+}$/g);
    if (match === null) {
        return rawString;
    }

    // TODO: this will not work if the raw Regex in the JSON has options, for instance the case insensitive ex: /FS/i
    return rawString.slice(0, -2).replace('${/', '');
};

DataParser.prototype.parse = function (data) {
    var parserVariables = this.parserVariables;
    if(typeof data === 'undefined') {
        return;
    }

    if(Array.isArray(data)) {
        var parsedData = [];

        for(var i = 0; i < data.length; i++) {
            if(typeof data[i] === 'string') {
                parsedData.push(parseString.call(this, data[i]));
            } else {
                parsedData.push(data[i]);
            }
        }

        return parsedData;
    }

    return parseString.call(this, data);

    function parseString(dataString) {
        var parsed = dataString;

        if(typeof dataString === 'undefined') {
            console.error('undefined dataString passed to #parseString');
        }

        for (var i in parserVariables) {
            parsed = this.interpolate(parsed, i);
        }

        parsed = this.convertRegex(parsed);

        return parsed;
    }
};