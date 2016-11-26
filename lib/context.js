var context;

(function () {
    context = contextFactory;

    function contextFactory (metadata, data) {
        var setupItemsId = metadata.setupItemsId;
        var expectationsId = metadata.expectationsId;
        var chainId = metadata.chainIdentifier;
        var context = new Context(setupItemsId, expectationsId, chainId, data);
        context.hydrate(metadata.otherData);
        return context;
    }

    function Context(setupItemsId, expectationsId, chainIdentifier, data){
        this.data = data;
        this.children = [];
        this.description = data.itShould;
        this.chainId = chainIdentifier;
        this.expectationsId = expectationsId;
        this.setupItemsId = setupItemsId;
        this.expectations = [];

        this.hydrate = hydrate;
        this.getContextScope = getContextScope;
        this.getChildFunctionName = getChildFunctionName;
        this.getChildSelector = getChildSelector;
        this.otherData = {};
    }

    function hydrate (otherData) {
        var setupItemsId = this.setupItemsId;

        var items = this.data[setupItemsId];

        for(var i = 0; i < items.length; i++){
            this.children.push(items[i]);
        }
        
        if(this.expectationsId) {
            var expectationsId = this.expectationsId;
            this.expectations = this.data[expectationsId];
        }

        if(Array.isArray(otherData)) {
            var otherKey;
            for(var j = 0; j < otherData.length; j++){
                otherKey = otherData[j];
                this.otherData[otherKey] = this.data[otherKey];
            }
        }
    }

    function getChildSelector(childIndex) {
        return this.children[childIndex][this.chainId];
    }

    function getChildFunctionName(childIndex) {
        for (var fname in this.children[childIndex]) {
            if (fname !== this.chainId) {
                return fname;
            }
        }
    }

    function getContextScope(childFname, childFargs, childSelector) {
        var scope = {
            fname: childFname,
            fargs: childFargs,
            selector: childSelector,
            chainId: this.chainId,
            expectations: this.expectations
        };

        for(var k in this.otherData){
            scope[k] = this.otherData[k];
        }

        return scope;
    }
}());