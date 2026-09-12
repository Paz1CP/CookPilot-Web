const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "../app/continuation-data.ts"),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const moduleExports = {};
vm.runInNewContext(compiled, { exports: moduleExports, Intl });
const {
  ingredients,
  ingredientAmount,
  formatAmount,
  days,
  discoveries,
  food,
  links,
} = moduleExports;
const find = (id) => ingredients.find((item) => item.id === id);

test("two servings aggregate real tomato contributions from both recipes", () => {
  const result = ingredientAmount(find("tomato"), { lomo: 2, salad: 2 }, true);
  assert.equal(result.lomo, 125);
  assert.equal(result.salad, 110);
  assert.equal(result.total, 235);
});
test("recipe portion controls do not scale the other recipe", () => {
  const result = ingredientAmount(find("tomato"), { lomo: 4, salad: 2 }, true);
  assert.equal(result.lomo, 250);
  assert.equal(result.salad, 110);
  assert.equal(result.total, 360);
});
test("removing salad removes only its contribution and its exclusive ingredients", () => {
  assert.equal(
    ingredientAmount(find("tomato"), { lomo: 2, salad: 4 }, false).total,
    125,
  );
  assert.equal(
    ingredientAmount(find("avocado"), { lomo: 2, salad: 4 }, false).total,
    0,
  );
  assert.equal(
    ingredients.filter(
      (item) => ingredientAmount(item, { lomo: 2, salad: 2 }, false).total > 0,
    ).length,
    14,
  );
});
test("four portions reproduce both canonical four-serving recipes", () => {
  for (const item of ingredients) {
    assert.equal(
      ingredientAmount(item, { lomo: 4, salad: 4 }, true).total,
      item.lomo + item.salad,
    );
    assert.ok(["g", "ml"].includes(item.unit));
    assert.ok(item.lomo >= 0 && item.salad >= 0);
  }
  assert.equal(
    new Set(ingredients.map((item) => item.id)).size,
    ingredients.length,
  );
});
test("fractional spice quantities are not rounded to zero", () => {
  assert.equal(formatAmount(0.25), "0.25");
  assert.equal(formatAmount(17.5), "17.5");
  assert.equal(formatAmount(235), "235");
});
test("week has seven fixed days with Saturday fourth", () => {
  assert.equal(days.length, 7);
  assert.equal(days[3].name, "Saturday");
  assert.equal(days[3].date, 18);
});
test("all local food assets exist through the LAB public junction", () => {
  for (const url of Object.values(food))
    assert.ok(fs.existsSync(path.join(__dirname, "../public", url)), url);
});
test("discovery has eight distinct real public identities and official covers", () => {
  assert.equal(discoveries.length, 8);
  assert.equal(new Set(discoveries.map((item) => item.slug)).size, 8);
  for (const item of discoveries)
    assert.equal(new URL(item.image).host, "media.cookpilot.pro");
  assert.ok(links.play.includes("com.cookpilot.pe"));
  assert.ok(links.huawei.includes("C118044413"));
});
