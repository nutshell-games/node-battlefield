var Greeter = (function () {
    function Greeter(message) {
        this.greeting = message;
    }
    Greeter.prototype.greet = function () {
        return 'Bonjour, ' + this.greeting + '!';
    };
    Greeter.prototype.kill = function () {
        return "you";
    };
    return Greeter;
})();
module.exports = Greeter;
