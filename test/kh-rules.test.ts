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
// kh-triple-touten
// ---------------------------------------------------------------------------
describe("kh-triple-touten — 読点3個以上の連続", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-triple-touten")!;

  describe("detections", () => {
    it("flags 、、、 (3 consecutive)", () => {
      const issues = rule().lint("A、、、B。", CONFIG);
      expect(issues).toHaveLength(1);
    });

    it("flags 、、、、 (4 consecutive)", () => {
      expect(rule().lint("A、、、、B", CONFIG).length).toBeGreaterThan(0);
    });
  });

  describe("false positives (2個以内連続 → スルー)", () => {
    const clean = ["春が来て、花が咲き、鳥が鳴いた。", "彼は、静かに去った。", "A、B。"];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("A、、、B", { ...CONFIG, enabled: false })).toHaveLength(0);
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
// kh-mixed-fw-hw-bracket
// ---------------------------------------------------------------------------
describe("kh-mixed-fw-hw-bracket — 全角・半角括弧の混在", () => {
  const rule = () =>
    ruleset.createRules(createTestContext()).find((r) => r.id === "kh-mixed-fw-hw-bracket")!;

  describe("detections", () => {
    it("flags full-width open + half-width close", () => {
      const issues = rule().lint("文章（補足)が続く。", CONFIG);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].fix?.replacement).toBe("（補足）");
    });

    it("flags half-width open + full-width close", () => {
      const issues = rule().lint("文章(補足）が続く。", CONFIG);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].fix?.replacement).toBe("(補足)");
    });
  });

  describe("false positives (統一された括弧 → スルー)", () => {
    const clean = [
      "文章（補足）が続く。",
      "文章(note)が続く。",
      "（東京）で開催。",
      "(Tokyo) area.",
    ];
    for (const text of clean) {
      it(`leaves "${text}" untouched`, () => {
        expect(rule().lint(text, CONFIG)).toHaveLength(0);
      });
    }
  });

  describe("behavior", () => {
    it("does nothing when disabled", () => {
      expect(rule().lint("文章（補足)が続く。", { ...CONFIG, enabled: false })).toHaveLength(0);
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
