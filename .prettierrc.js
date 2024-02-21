module.exports = {
    printWidth: 120,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "avoid",
    semi: true,
    plugins: ["@trivago/prettier-plugin-sort-imports"],
    importOrder: ["<THIRD_PARTY_MODULES>", "^@pallad/(.*)$", "^[./]"],
    importOrderSeparation: true,
};
