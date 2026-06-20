import { describe, it, expect } from "vitest";

import ruleset from "../src/index";
import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";

/**
 * Golden tests driven by manifest.docs — every rule's positive example must
 * yield 0 issues, and its negative example must yield >= 1.
 */
describe("ruleset golden examples", () => {
  const rules = ruleset.createRules(createTestContext());

  for (const meta of manifest.rules) {
    describe(meta.ruleId, () => {
      const rule = rules.find((r) => r.id === meta.ruleId);

      it("is built by createRules", () => {
        expect(rule, `rule ${meta.ruleId} not returned by createRules`).toBeDefined();
      });

      it("positive example yields no issue", () => {
        expect(rule!.lint(meta.docs.positiveExample, CONFIG)).toHaveLength(0);
      });

      it("negative example is flagged", () => {
        expect(rule!.lint(meta.docs.negativeExample, CONFIG).length).toBeGreaterThan(0);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// kh-leader-double
// ---------------------------------------------------------------------------
describe("kh-leader-double — 三点リーダーは偶数個", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-leader-double")!;

  describe("detections (奇数個 → 検出)", () => {
    it("flags single …", () => {
      const issues = rule().lint("彼は黙って去っていった…。", CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe("……");
    });

    it("flags triple …", () => {
      const issues = rule().lint("そして…………………と言った。", CONFIG);
      // 7 個 = odd → 1 issue
      expect(issues).toHaveLength(1);
    });
  });

  describe("false positives (偶数個 → スルー)", () => {
    const clean = [
      "彼は黙って去っていった……。",
      "どうして……なのだろう……。",
      "「……」と言った。",
    ];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("待って…", { ...CONFIG, enabled: false })).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// kh-dash-double
// ---------------------------------------------------------------------------
describe("kh-dash-double — 全角ダーシは偶数個", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-dash-double")!;

  describe("detections", () => {
    it("flags single —", () => {
      const issues = rule().lint("東京—そこが彼女の故郷だった。", CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe("——");
    });

    it("flags triple —", () => {
      const issues = rule().lint("それは———驚くべきことだった。", CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe("————");
    });
  });

  describe("false positives (偶数個 → スルー)", () => {
    const clean = ["東京——そこが彼女の故郷だった。", "一つ——それは秘密——を告げた。"];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("東京—大阪", { ...CONFIG, enabled: false })).toHaveLength(0);
    });

    it("does not flag half-width hyphen", () => {
      expect(rule().lint("first-class", CONFIG)).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// kh-kurikaeshi-kanji-2
// ---------------------------------------------------------------------------
describe("kh-kurikaeshi-kanji-2 — 漢字2字以上のあとの々", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-kurikaeshi-kanji-2")!;

  describe("detections", () => {
    it("flags 主義々", () => {
      const issues = rule().lint("民主主義々を唱える。", CONFIG);
      expect(issues.length).toBeGreaterThan(0);
    });

    it("flags 制度々", () => {
      expect(rule().lint("新しい制度々が導入された。", CONFIG).length).toBeGreaterThan(0);
    });
  });

  describe("false positives (1字 + 々 → スルー)", () => {
    const clean = ["人々が集まった。", "国々の代表。", "年々増加する。", "日々の生活。"];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("民主主義々", { ...CONFIG, enabled: false })).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// kh-kurikaeshi-kana-ichi
// ---------------------------------------------------------------------------
describe("kh-kurikaeshi-kana-ichi — ゝ・ヽ の使用", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-kurikaeshi-kana-ichi")!;

  describe("detections", () => {
    it("flags ゝ", () => {
      expect(rule().lint("ことゝ同じ。", CONFIG).length).toBeGreaterThan(0);
    });

    it("flags ヽ", () => {
      expect(rule().lint("カヽカヽ鳥。", CONFIG).length).toBeGreaterThan(0);
    });
  });

  describe("false positives (正常な現代文 → スルー)", () => {
    const clean = ["かわいい子。", "ことことと煮る。", "カタカナ表記。"];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("ことゝ", { ...CONFIG, enabled: false })).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// kh-exclaim-kuten
// ---------------------------------------------------------------------------
describe("kh-exclaim-kuten — 感嘆符・疑問符の直後に句点", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-exclaim-kuten")!;

  describe("detections", () => {
    it("flags ！。", () => {
      const issues = rule().lint("本当においしい！。またきます。", CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe("！");
    });

    it("flags ？。", () => {
      const issues = rule().lint("それは本当ですか？。", CONFIG);
      expect(issues).toHaveLength(1);
    });

    it("flags half-width !。", () => {
      const issues = rule().lint("すごい!。", CONFIG);
      expect(issues).toHaveLength(1);
    });
  });

  describe("false positives (正常 → スルー)", () => {
    const clean = [
      "本当においしい！　またきます。",
      "それは本当ですか？　お答えください。",
      "ありがとう！",
      "本当に？",
    ];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("すごい！。", { ...CONFIG, enabled: false })).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// kh-double-kuten
// ---------------------------------------------------------------------------
describe("kh-double-kuten — 句点の重複", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-double-kuten")!;

  describe("detections", () => {
    it("flags 。。", () => {
      const issues = rule().lint("終わった。。次に進む。", CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe("。");
    });

    it("flags 。。。", () => {
      const issues = rule().lint("終わった。。。", CONFIG);
      expect(issues).toHaveLength(1);
    });
  });

  describe("false positives (正常 → スルー)", () => {
    const clean = ["終わった。次に進む。", "一文。二文。"];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("終わった。。", { ...CONFIG, enabled: false })).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// kh-wave-dash-double
// ---------------------------------------------------------------------------
describe("kh-wave-dash-double — 波ダーシの重複", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-wave-dash-double")!;

  describe("detections", () => {
    it("flags 〜〜", () => {
      const issues = rule().lint("東京〜〜大阪間を移動した。", CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe("〜");
    });

    it("flags 〜〜〜", () => {
      expect(rule().lint("〜〜〜", CONFIG)).toHaveLength(1);
    });
  });

  describe("false positives (単独 → スルー)", () => {
    const clean = ["東京〜大阪間を移動した。", "3〜5時間かかる。"];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("東京〜〜大阪", { ...CONFIG, enabled: false })).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// kh-nakaguro-double
// ---------------------------------------------------------------------------
describe("kh-nakaguro-double — 中黒の重複", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-nakaguro-double")!;

  describe("detections", () => {
    it("flags ・・ (Japanese middle dot, U+30FB)", () => {
      const issues = rule().lint("東京・・大阪", CONFIG);
      expect(issues).toHaveLength(1);
      expect(issues[0].fix?.replacement).toBe("・");
    });

    it("flags ・・・ (3 consecutive)", () => {
      const issues = rule().lint("A・・・B", CONFIG);
      expect(issues).toHaveLength(1);
    });
  });

  describe("false positives (単独 → スルー)", () => {
    const clean = ["東京・大阪・名古屋", "A・B・C", "サービス・プロダクト"];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("東京··大阪", { ...CONFIG, enabled: false })).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Edge-case tests — boundaries, FP guards, compound/substring/punctuation traps
// ---------------------------------------------------------------------------

// kh-leader-double: boundary/compound edge cases
describe("kh-leader-double — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-leader-double")!;

  it("flags 5 consecutive … (odd run)", () => {
    // Five U+2026 characters
    const text = "あの日のこと" + "…".repeat(5) + "が忘れられない。";
    const issues = rule().lint(text, CONFIG);
    // 5 = odd → fix suggests 6
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("…".repeat(6));
  });

  it("flags two separate odd runs independently", () => {
    const issues = rule().lint("そして…待った…。", CONFIG);
    // two single … → 2 issues
    expect(issues).toHaveLength(2);
  });

  it("leaves 4 consecutive … untouched (even)", () => {
    expect(rule().lint("彼女は" + "…".repeat(4) + "と言った。", CONFIG)).toHaveLength(0);
  });

  it("leaves 6 consecutive … untouched (even)", () => {
    expect(rule().lint("…".repeat(6), CONFIG)).toHaveLength(0);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });

  it("text without any … → no issue", () => {
    expect(rule().lint("春は曙。やうやう白くなりゆく山際。", CONFIG)).toHaveLength(0);
  });

  it("mixed even and odd runs: only odd run flagged", () => {
    // 2 (even) + space + 1 (odd)
    const text = "終わった……。でも…まだ続く。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].originalText).toBe("…");
  });
});

// kh-dash-double: boundary/compound edge cases
describe("kh-dash-double — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-dash-double")!;

  it("flags 5 consecutive — (odd run)", () => {
    const text = "それは" + "—".repeat(5) + "驚くべきことだ。";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("—".repeat(6));
  });

  it("leaves 4 consecutive — untouched (even)", () => {
    expect(rule().lint("東京" + "—".repeat(4) + "大阪。", CONFIG)).toHaveLength(0);
  });

  it("does not flag en-dash U+2013", () => {
    expect(rule().lint("第1章–第3章", CONFIG)).toHaveLength(0);
  });

  it("does not flag ASCII hyphen in word", () => {
    expect(rule().lint("long-term plan", CONFIG)).toHaveLength(0);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });
});

// kh-kurikaeshi-kanji-2: substring / compound traps
describe("kh-kurikaeshi-kanji-2 — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-kurikaeshi-kanji-2")!;

  // These must NOT be flagged (single kanji + 々 = correct)
  it("leaves 世々 untouched (single kanji + 々)", () => {
    expect(rule().lint("世々を経て。", CONFIG)).toHaveLength(0);
  });

  it("leaves 様々 untouched (single kanji + 々)", () => {
    expect(rule().lint("様々な意見がある。", CONFIG)).toHaveLength(0);
  });

  it("leaves 各々 untouched (single kanji + 々)", () => {
    expect(rule().lint("各々の判断に任せる。", CONFIG)).toHaveLength(0);
  });

  // These must be flagged (2+ kanji + 々 = wrong)
  it("flags 社会々 (2 kanji + 々)", () => {
    expect(rule().lint("社会々の問題。", CONFIG).length).toBeGreaterThan(0);
  });

  it("flags 経済々 (2 kanji + 々)", () => {
    expect(rule().lint("経済々の状況。", CONFIG).length).toBeGreaterThan(0);
  });

  it("flags 三文字漢語 (3 kanji) + 々", () => {
    // 共産主義 + 々 = wrong
    expect(rule().lint("共産主義々の理念。", CONFIG).length).toBeGreaterThan(0);
  });

  it("does not flag 々 at start of text (no preceding kanji)", () => {
    // 々 alone — no preceding kanji match
    expect(rule().lint("々と続く話。", CONFIG)).toHaveLength(0);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });
});

// kh-kurikaeshi-kana-ichi: edge cases
describe("kh-kurikaeshi-kana-ichi — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-kurikaeshi-kana-ichi")!;

  it("flags multiple ゝ in one string", () => {
    const issues = rule().lint("ことゝ、ものゝ考え方。", CONFIG);
    expect(issues).toHaveLength(2);
  });

  it("flags ヽ in katakana context", () => {
    const issues = rule().lint("カヽカヽと鳴く鳥。", CONFIG);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("does not flag ゞ (voiced iteration mark U+309E)", () => {
    // ゞ is a different character — not in scope
    expect(rule().lint("ますます", CONFIG)).toHaveLength(0);
  });

  it("does not flag 々 (kanji iteration mark)", () => {
    expect(rule().lint("人々が集まった。", CONFIG)).toHaveLength(0);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });
});

// kh-exclaim-kuten: punctuation/boundary traps
describe("kh-exclaim-kuten — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-exclaim-kuten")!;

  it("flags ？。", () => {
    const issues = rule().lint("本当ですか？。はい。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("？");
  });

  it("flags half-width ?。", () => {
    const issues = rule().lint("really?。続き", CONFIG);
    expect(issues).toHaveLength(1);
  });

  it("multiple violations in one string: count matches", () => {
    const issues = rule().lint("すごい！。ほんと？。", CONFIG);
    expect(issues).toHaveLength(2);
  });

  it("does not flag ！ followed by 、(読点, not 。)", () => {
    expect(rule().lint("すごい！、と彼は言った。", CONFIG)).toHaveLength(0);
  });

  it("does not flag ！ alone at end of string", () => {
    expect(rule().lint("やった！", CONFIG)).toHaveLength(0);
  });

  it("does not flag sentence-internal 。 without preceding ！/？", () => {
    expect(rule().lint("終わった。次に進む。", CONFIG)).toHaveLength(0);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });
});

// kh-double-kuten: boundary traps
describe("kh-double-kuten — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-double-kuten")!;

  it("flags 4 consecutive 。 as single issue with fix 。", () => {
    const issues = rule().lint("終わった。。。。次。", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("。");
  });

  it("two separate double-kuten produce two issues", () => {
    const issues = rule().lint("失敗した。。また失敗した。。", CONFIG);
    expect(issues).toHaveLength(2);
  });

  it("does not flag lone 。 at end", () => {
    expect(rule().lint("完了した。", CONFIG)).toHaveLength(0);
  });

  it("does not flag ！。 (different marks — exclaim-kuten rule handles that)", () => {
    // kh-double-kuten only cares about 。。
    // ！。 should NOT be flagged by double-kuten (no two consecutive 。)
    expect(rule().lint("すごい！。", CONFIG)).toHaveLength(0);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });
});

// kh-wave-dash-double: boundary traps
describe("kh-wave-dash-double — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-wave-dash-double")!;

  it("flags 4 consecutive 〜 (≥2 is always wrong)", () => {
    const text = "東京" + "〜".repeat(4) + "大阪";
    const issues = rule().lint(text, CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("〜");
  });

  it("does not flag full-width tilde ～ (U+FF5E, different char)", () => {
    // U+FF5E ～ is not the same as U+301C 〜
    expect(rule().lint("東京～～大阪", CONFIG)).toHaveLength(0);
  });

  it("two separate double-〜 produce two issues", () => {
    const issues = rule().lint("朝〜〜夜、春〜〜秋。", CONFIG);
    expect(issues).toHaveLength(2);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });
});

// kh-nakaguro-double: boundary/halfwidth traps
describe("kh-nakaguro-double — edge cases", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-nakaguro-double")!;

  it("flags halfwidth ･ U+FF65 doubled", () => {
    const issues = rule().lint("東京･･大阪", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("・");
  });

  it("flags mix of fullwidth and halfwidth ・・ as double (U+30FB then U+FF65)", () => {
    const issues = rule().lint("東京・･大阪", CONFIG);
    expect(issues).toHaveLength(1);
  });

  it("does not flag interpunct U+00B7 · (Latin middle dot)", () => {
    // Different character; not targeted
    expect(rule().lint("a·b·c", CONFIG)).toHaveLength(0);
  });

  it("three・・・produces one issue (not three)", () => {
    const issues = rule().lint("A・・・B", CONFIG);
    expect(issues).toHaveLength(1);
  });

  it("two separate double-・ in one string: two issues", () => {
    const issues = rule().lint("東京・・大阪・・名古屋", CONFIG);
    expect(issues).toHaveLength(2);
  });

  it("empty string → no issue", () => {
    expect(rule().lint("", CONFIG)).toHaveLength(0);
  });
});
