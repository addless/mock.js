var dataDriven;

var before = function (before) { before(); };

(function () {
    window.__karma__.loaded = function () {};

    var dataDrivenStore = [];
    var dataRequestCount = 0;
    var driverItSuiteQueue = [];
    var karmaStarted = false;

    function dataDrivenFactory (url) {
        var driver = new DataDriven(url);

        driver.getData(callback);
        addToStore(driver);

        return driver;

        function callback () {
            dataRequestCount++;

            setTimeout(function () {
                if(dataDrivenStore.length === dataRequestCount) {
                    driverItSuiteQueue.forEach(function (suiteFn) {
                        suiteFn();
                    });

                    if(karmaStarted === false) {
                        window.__karma__.start();
                        karmaStarted = true; // TODO: why is this being called twice, that's why we have this variable
                    }
                }
                // TODO: figure out why we need a timeout here, it seems that without it we are getting F as undefined, investigate race condition
            }, 500);
        }

        function addToStore (driver) {
            dataDrivenStore.push({
                index: dataDrivenStore.length,
                item: driver
            });
        }
    }

    dataDriven = dataDrivenFactory;

    function DataDriven(dataUrl) {
        this.dataUrl = dataUrl;
        this.parser = new DataParser();
        this.contextMetadata = null;
        this.helperFunc = null;
        this.executeFn = function (done) {};
    }

    Object.defineProperties(DataDriven.prototype, {
        setHelperFunc:          { value: setHelperFunc },
        executeTests:           { value: testsExecutor },
        data:                   { value: [] },
        getData:                { value: getData },
        suiteName:              { value: '' },
        parse:                  { value: this.parser.parse },

        // TODO: Discuss implementation choices with team
        // The main reason for replacing the jasmine it for data driven tests is because using the describe in the
        //  custom driveIt we can benefit immensly from the native jasmine-karma adapter reporting per spec by placing
        //  each data driven test were in it's own spec it body. This makes debugging so much easier if a test fails due
        //  to easier traceability provided by the stack trace. Implementing this while running all driver tests in a single
        //  spec body proved a bit too clunky and was not straightforward.
        it:                     { value: driverIt },
        setParserVariables:     { value: setParserVariables },
        setContextMetadata:     { value: setContextMetadata },
        deriveContext:          { value: deriveContext }
    });

    function setContextMetadata(metadata) {
        this.contextMetadata = metadata;
        return this;
    }

    function deriveContext(data) {
        return context(this.contextMetadata, data);
    }

    function setParserVariables(parserVariables) {
        this.parser.parserVariables = parserVariables;
        return this;
    }

    function driverIt(suiteName, suitFn) {
        Object.defineProperty(this, 'suiteName', {
            value: suiteName,
            enumerable: true
        });
        driverItSuiteQueue.push(function () {
            describe(suiteName, suitFn);
        });
    }

    function setHelperFunc(helperFunc){
        this.helperFunc = helperFunc;
        return this;
    }

    function testsExecutor(executeFn) {
        this.executeFn = executeFn;

        var data = this.data;
        var contextArgs;
        var context;
        var me = this;

        data.forEach(function (rawContext) {
            context = this.deriveContext(rawContext);
            describe('', function () {
                it('should ' + context.itShould, function (done){
                    contextArgs = [context, done];
                    executeContext.apply(me, contextArgs);
                });
            });
        });
        return this;
    }

    function executeContext(ctx, done) {
        var childCtx, childFname, childFargs, childSelector, helperArgs;
        var testScope = {};
        var lastHelperFuncReturn = {};
        var executeFn = this.executeFn;
        var dataParser = this.parser;
        var isLastChild = false;
        try {
            for (var i = 0; i < ctx.children.length; i++) {
                childCtx = ctx.children[i];

                childFname = dataParser.parse(ctx.getChildFunctionName(i));
                childFargs = dataParser.parse(childCtx[childFname]);
                childSelector = dataParser.parse(ctx.getChildSelector(i));

                if (i === ctx.children.length - 1) {
                    isLastChild = true;
                    if (typeof done === 'function') {
                        childFargs.push(done);
                    }
                }

                testScope = ctx.getContextScope(childFname, childFargs, childSelector);

                if(typeof this.helperFunc === 'function') {
                    helperArgs = [lastHelperFuncReturn];
                    if(isLastChild) {
                        helperArgs.push(execute);
                    }
                    lastHelperFuncReturn = this.helperFunc.apply(testScope, helperArgs);
                    continue;
                }

                execute();
                
                function execute() {
                    executeFn.apply(testScope, [done]);
                }
            }
        } catch (e) {
            console.error('data driven test exception ', e);
            console.log(testScope);
        }
    }

    function getData(callback) {
        var x = new XMLHttpRequest();
        x.open('GET', this.dataUrl);
        x.onload = onload;
        x.send();

        var me = this;
        function onload() {
            var data = JSON.parse(this.responseText);

            Object.defineProperty(me, 'data', {
                value: data,
                enumerable: true
            });

            callback();
        }

        return this;
    }

})();