Strategy = (function () {

    var TYPE = {
        FUNCTION: 'function',
        OBJECT: 'object',
        UNDEFINED: 'undefined',
        ARRAY: '[object Array]'
    };

    var _toString = Object.prototype.toString;

    var _flag = ':';

    function Strategy() {
        this.strategyLib = {};
        this.cache = [];
        this.getValue = null;
        this.getContext = function () {
            return null;
        };
    }

    Strategy.prototype.addStrategy = function addStrategy(strategyName, fn) {
        if (TYPE.UNDEFINED !== typeof this.strategyLib[strategyName]) {
            throw TypeError('strategyName: ' + strategyName + ' has allreay extist');
        }
        if (TYPE.FUNCTION !== typeof fn) {
            throw TypeError('fn must be function');
        }
        this.strategyLib[strategyName] = fn;
    }

    Strategy.prototype.addRule = function addRules(rule) {
        var strategyAry,
            i = 0,
            len = rule.length,
            self = this;

        // [{strategy: 'min:6', ret: ''}]
        if (TYPE.ARRAY === _toString.call(rule)) {
            for (; i < len; i++) {
                var item = rule[i];
                (function (item) {
                    var strategyAry = item.strategy.split(_flag);

                    self.cache.push(function () {
                        var ret = item.ret;
                        var strategy = strategyAry.shift();
                        var value = self.getValue();
                        var context = self.getContext();
                        strategyAry.unshift(value);
                        strategyAry.push(ret);
                        return self.strategyLib[strategy].apply(context, strategyAry);
                    })
                })(item);
            }
        }
        // {strategy: 'min:6', ret: ''}
        else {
            var strategyAry = rule.strategy.split(_flag);
            var context = (TYPE.OBJECT === typeof rule.context) ? rule.context : null;
            ret = rule.ret;

            self.cache.push(function () {
                var strategy = strategyAry.shift();
                strategyAry.unshift(self.getValue);
                strategyAry.push(ret);
                return self.strategyLib[strategy].apply(context, strategyAry);
            })
        }
    }

    Strategy.prototype.execute = function (getValue, getContext) {

        var ruleHandle, ret,
            self = this,
            i = 0,
            len = this.cache.length;

        if (TYPE.FUNCTION !== typeof getValue) {
            throw new TypeError('getValue must be function');
        }
        if (TYPE.FUNCTION !== typeof getContext) {
            throw new TypeError('getContext must be function');
        }

        self.getValue = getValue;
        self.getContext = getContext;

        for (; i < len; i++) {
            ruleHandle = self.cache[i];
            ret = ruleHandle();
            if (ret) {
                return ret;
            }
        }
    }

    return Strategy;
})();