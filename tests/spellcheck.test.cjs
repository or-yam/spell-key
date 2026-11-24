const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { join } = require("node:path");
const { test } = require("node:test");

function check(selection) {
  const output = execFileSync(join(__dirname, "../assets/spellcheck-native"), [selection], {
    encoding: "utf8",
  });
  return JSON.parse(output);
}

test("leaves correctly spelled words alone", () => {
  assert.deepEqual(check("receive"), { status: "correct", suggestions: [] });
  assert.deepEqual(check("“receive,”"), { status: "correct", suggestions: [] });
});

test("suggests corrections for a misspelled word", () => {
  const result = check("recieve");
  assert.equal(result.status, "misspelled");
  assert.ok(result.suggestions.includes("receive"));
});

test("distinguishes a misspelling without suggestions from a correctly spelled word", () => {
  assert.deepEqual(check("qzxqzxqzxqzx"), { status: "misspelled", suggestions: [] });
});

test("preserves surrounding punctuation and whitespace in every replacement", () => {
  const plain = check("recieve");
  const wrapped = check(" \t“recieve,”\n");
  assert.equal(wrapped.status, "misspelled");
  assert.deepEqual(
    wrapped.suggestions,
    plain.suggestions.map((word) => ` \t“${word},”\n`),
  );
});

test("rejects selections without exactly one word", () => {
  for (const selection of ["hello world", "hello,world", "hello—world", "?!"]) {
    assert.deepEqual(check(selection), { status: "invalid-selection", suggestions: [] });
  }
});

test("preserves the correctly spelled part of a hyphenated word", () => {
  const result = check("recieve-only");
  assert.equal(result.status, "misspelled");
  assert.ok(result.suggestions.includes("receive-only"));
});
