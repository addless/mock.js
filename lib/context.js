var context;

(function () {
    context = contextFactory;

    function contextFactory (metadata, data) {
        var setupItemsId = metadata.setupItemsId;
        var expectationsId = metadata.expectationsId;
        var chainId = metadata.chainIdentifier;
        var context = new Context(setupItemsId, expectationsId, chainId, data);
        context.hydrate();
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
    }

    function hydrate () {
        var setupItemsId = this.setupItemsId;

        var items = this.data[setupItemsId];

        for(var i = 0; i < items.length; i++){
            this.children.push(items[i]);
        }
        
        if(this.expectationsId) {
            var expectationsId = this.expectationsId;
            this.expectations = this.data[expectationsId];
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
        return {
            fname: childFname,
            fargs: childFargs,
            selector: childSelector,
            chainId: this.chainId,
            expectations: this.expectations
        };
    }
}());