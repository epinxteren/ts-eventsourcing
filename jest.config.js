module.exports = {
    collectCoverage: true,
    testURL: 'http://localhost',
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "src/**/*.{ts}",
        "!**/*test.{ts}",
        "!**/*.d.{ts}",
        "!**/build"
    ],
    coverageThreshold: {
        "global": {
            "branches": 100,
            "functions": 100,
            "lines": 100,
            "statements": 0
        }
    },
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