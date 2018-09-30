module.exports = {
    collectCoverage: false,
    testEnvironment: 'node',
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json"
    ],
    transform: {
        "\\.(ts|tsx)$": "ts-jest"
    },
    testRegex: ".*\\.test\\.ts$",
    globals: {
        "ts-jest": {
            tsConfigFile: "tsconfig.json",
        }
    }
};