[{
    "itShould": "match request header on equality",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": "1, 1"}]}, {"setResponseBody": [{"mock": ["body"]}]}, {"setRequestHeader": ["a", 1]}, {"setRequestHeader": ["a", 1]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body']}"}
}, {
    "itShould": "match request headers using a regex pattern and an equality",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": "1, 6"}]}, {"ifRequestHeader": [{"b": {}}]}, {"setResponseBody": [{"mock": ["body2"]}]}, {"setRequestHeader": ["a", 1]}, {"setRequestHeader": ["a", 6]}, {"setRequestHeader": ["b", 133]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body2']}"}
}, {
    "itShould": "match request header set with multiple keys",
    "xhrMockMethods": [{
        "ifRequestHeader": [{
            "a": "1, 1",
            "b": "multiple",
            "c": "d"
        }]
    }, {"setResponseBody": [{"mock": ["body3"]}]}, {"setRequestHeader": ["a", 1]}, {"setRequestHeader": ["a", 1]}, {"setRequestHeader": ["b", "multiple"]}, {"setRequestHeader": ["c", "d"]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body3']}"}
}, {
    "itShould": "not match on a duplicated equality request header key for the first duplicate equality",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": "1"}]}, {"ifRequestHeader": [{"a": "2"}]}, {"setResponseBody": [{"mock": ["body3.5"]}]}, {"setRequestHeader": ["a", "1"]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':'json'}"}
}, {
    "itShould": "not match on a duplicated equality request header key for the most recent duplicate equality",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": "1"}]}, {"ifRequestHeader": [{"a": "2"}]}, {"setResponseBody": [{"mock": ["body3.25"]}]}],
    "sendOptions": {"setRequestHeaders": [["a", "2"]]},
    "expected": {"responseBody": "{'mock':'json'}"}
}, {
    "itShould": "not match on a duplicated regex request header key for the first duplicate regex key",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": {}}]}, {"ifRequestHeader": [{"a": {}}]}, {"setResponseBody": [{"mock": ["body3.35"]}]}, {"setRequestHeader": ["a", "kd1"]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':'json'}"}
}, {
    "itShould": "not match on a duplicated regex request header key for the most recent duplicate regex key",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": {}}]}, {"ifRequestHeader": [{"a": {}}]}, {"setResponseBody": [{"mock": ["body3.45"]}]}, {"setRequestHeader": ["a", "lbj1"]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':'json'}"}
}, {
    "itShould": "match on a duplicated regex request header key if all patterns test true for the header",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": {}}]}, {"ifRequestHeader": [{"a": {}}]}, {"ifRequestHeader": [{"a": {}}]}, {"setResponseBody": [{"mock": ["body3.45"]}]}, {"setRequestHeader": ["a", "kd5lbj"]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body3.45']}"}
}, {
    "itShould": "not match on a duplicated regex request header key if any pattern tests false for the header",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": {}}]}, {"ifRequestHeader": [{"a": {}}]}, {"ifRequestHeader": [{"a": {}}]}, {"setResponseBody": [{"mock": ["body3.45"]}]}, {"setRequestHeaders": ["a", "kdlbj"]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':'json'}"}
}, {
    "itShould": "not match if request header pattern succeeds but equality fails",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": {}}]}, {"ifRequestHeader": [{"a": "kd32"}]}, {"setResponseBody": [{"mock": ["body3.65"]}]}, {"setRequestHeaders": ["a", "kd22"]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':'json'}"}
}, {
    "itShould": "match the response status",
    "xhrMockMethods": [{"ifRequestHeader": [{"a": "1, 1"}]}, {"setResponseStatus": [400]}, {"setResponseBody": [{"mock": ["body4"]}]}, {"setRequestHeader": ["a", 1]}, {"setRequestHeader": ["a", 1]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body4']}", "responseStatus": 400}
}, {
    "itShould": "mock response based on location param equality",
    "xhrMockMethods": [{"ifLocationParam": [{"a": "1"}]}, {"setResponseHeader": [{"c": 1}]}, {
        "setResponseHeader": [{
            "c": 1,
            "d": 1
        }]
    }, {"setResponseHeader": [{"c": 1, "d": 1, "e": 5}]}, {"setResponseBody": [{"mock": ["body5"]}]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body5']}"}
}, {
    "itShould": "mock response based on multiple location param equality",
    "xhrMockMethods": [{
        "ifLocationParam": [{
            "a": "1",
            "b": "b",
            "c": "d"
        }]
    }, {"setResponseHeader": [{"c": 1}]}, {"setResponseHeader": [{"c": 1, "d": 1}]}, {
        "setResponseHeader": [{
            "c": 1,
            "d": 1,
            "e": 5
        }]
    }, {"setResponseBody": [{"mock": ["body6"]}]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body6']}"}
}, {
    "itShould": "mock response based on most recent location param equality",
    "xhrMockMethods": [{"ifLocationParam": [{"a": "1", "b": "b"}]}, {
        "ifLocationParam": [{
            "a": "1",
            "b": "b",
            "c": "d"
        }]
    }, {"setResponseHeader": [{"c": 1}]}, {"setResponseHeader": [{"c": 1, "d": 1}]}, {
        "setResponseHeader": [{
            "c": 1,
            "d": 1,
            "e": 5
        }]
    }, {"setResponseBody": [{"mock": ["body7"]}]}],
    "sendOptions": {},
    "expected": {"responseBody": "{'mock':['body7']}"}
}]