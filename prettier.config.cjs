/*
 * @type {import('prettier').Options}
 */
module.exports = {
  ...require("@tqman/prettier-config"),
  importOrder: ["^~/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  trailingComma: "all",
  semi: true,
  endOfLine: "lf",
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};
