module.exports = function(config) {
    config.set({
        browsers: [
            'Chrome'/*,
            'Firefox',
            'Safari',
            'Opera'*/
        ],
        files: [
            'src/*.js',
            'spec/*.js'
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
