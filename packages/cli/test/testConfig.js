const {ENVDependency} = require("@pallad/config");

module.exports = () => {
    return {
        env1: new ENVDependency('NODE_ENV'),
        env2: new ENVDependency('FOO')
    }
}