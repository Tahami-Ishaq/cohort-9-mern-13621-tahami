module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    moduleNameMapper: {
        "^\\./api$": "<rootDir>/test/mocks/api.js",
        "\\.(css|less|scss)$": "<rootDir>/test/mocks/style.js",
    },
    transform: {
        "^.+\\.[jt]sx?$": "babel-jest",
    },
};