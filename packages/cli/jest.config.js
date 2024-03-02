module.exports = {
    preset: "@pallad/scripts",
    snapshotSerializers: ["<rootDir>/test/secretSerializer.ts"],
    coveragePathIgnorePatterns: ["test/fixtures/", "test/secretSerializer.ts"],
};
