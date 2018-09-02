module.exports = {
    collectCoverage: true,
    testURL: 'http://localhost',
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "src/**/*.{ts,tsx,js,jsx}",
        "!**/*test.{ts,tsx,js,jsx}",
        "!build/**",
        "!node_modules/**",
        "!**/node_modules/**",
        "!.yarn-cache/**"
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
    testRegex: ".*\\.test\\.(ts|tsx|js|jsx)$",
    globals: {
        "ts-jest": {
            tsConfigFile: "tsconfig.json",
        }
    }
};