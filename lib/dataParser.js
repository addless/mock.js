function DataParser () {
    this.parserVariables = {};
}

DataParser.prototype.interpolate = function (rawString, parserVariableKey) {
    return rawString.replace(new RegExp('{{' + parserVariableKey + '}}', 'g'), this.parserVariables[parserVariableKey]);
};

DataParser.prototype.convertRegex = function (rawString) {
    var match = rawString.match(/^\$.+}$/g);
    if (match === null) {
        return rawString;
    }

    // TODO: this will not work if the raw Regex in the JSON has options, for instance the case insensitive ex: /FS/i
    return new RegExp(rawString.slice(0, -1).replace('${', ''));
};

DataParser.prototype.parse = function (data) {
    var parserVariables = this.parserVariables;
    if(typeof data === 'undefined') {
        return;
    }

    return walkThroughData.call(this, data);

    function walkThroughData(data) {

        if(typeof data === 'string') {
            return parseString.call(this, data);
        }

        if(typeof data === 'object') {
            var keys = Object.keys(data);

            var parsedData = Object.create(data);
            var dataItem;
            var key;
            var parsedDataItem;

            for(var i = 0; i < keys.length; i++) {
                key = keys[i];
                dataItem = data[key];
                if(typeof dataItem === 'string') {
                    parsedDataItem = parseString.call(this, dataItem);
                } else if(typeof dataItem === 'object') {
                    parsedDataItem = walkThroughData.call(this, dataItem);
                }

                if(Array.isArray(parsedData) === true) {
                    parsedData[key].splice(key, 0, parsedDataItem);
                } else {
                    parsedData[key] = parsedDataItem;
                }
            }

            return parsedData;
        }

        return data;
    }

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