module.exports = function(config) {
    config.set({
        browsers: [
            'Chrome',
            'Firefox',
            'Safari',
            'Opera'
        ],
        files: [
            'src/**.js',
            'lib/data_driven.js',
            'spec/**.js',

            {pattern: 'spec/**.json', included: false}
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
