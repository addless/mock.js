module.exports = function(config) {
    config.set({
        browsers: [
            'Chrome',
            // 'Firefox',
            // 'Safari',
            // 'Opera'
        ],

        browserDisconnectTimeout: 30000,
        browserNoActivityTimeout: 30000,

        files: [
            'src/*.js',
            'lib/dataDriven.js',
            'lib/dataParser.js',
            'lib/specBody.js',
            'spec/dataDriven/*.js',
            'spec/*.js',

            {pattern: 'spec/*.json', included: false},
            {pattern: 'spec/dataDriven/*.json', included: false}

        ],
        frameworks: [
            'jasmine'
        ],
        reporters: [
            'progress',
            'growl-notifications'
        ]
    });
};
