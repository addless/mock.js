var dir = 'addless/mock.js/';
module.exports = function(config) {
    config.set({
        basePath: '../../',
        browsers: [
            'Chrome',
            'Firefox',
            'Safari',
            'Opera'
        ],
        files: [
            {pattern: 'bridgevine/ux-ba-test/lib/context.js'},
            {pattern: 'bridgevine/ux-ba-test/lib/dataParser.js'},
            {pattern: 'bridgevine/ux-ba-test/lib/dataDriven.js'},
            {pattern: 'bridgevine/ux-ba-test/addless/mock.js/**/*.json', included: false},

            dir + 'src/**.js',
            dir + 'lib/data_driven.js',
            dir + 'spec/**.js',

            {pattern: dir + 'spec/**.json', included: false}
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
