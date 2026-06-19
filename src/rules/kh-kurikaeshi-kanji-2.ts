/**
 * kh-kurikaeshi-kanji-2 — 々は漢字1字の繰り返しにのみ使う
 *
 * 同の字点「々」（U+3005）は「漢字1字の繰り返し」に用いる。
 * 「人々」「国々」「年々」は正しいが、漢字2字以上のあとに「々」が
 * 続く場合（例:「主義々」「制度々」）は誤用。
 *
 * 偽陽性回避:
 *   - 漢字1字 + 々 は正しいので対象外。
 *   - 漢字2字以上 + 々 の形のみを検出。
 *   - ひらがな・カタカナ + 々 も誤用だが、実例が稀なため対象外とする。
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

const REFERENCE = {
  standard: "標準 校正必携 第8版（日本エディタースクール）",
  section: "くり返し符号の使い方",
} as const;

// Match two or more kanji followed by 々
// \p{Script=Han} requires the 'u' flag
const PATTERN = /[一-鿿㐀-䶿]{2,}々/gu;

export function createKhKurikaeshiKanji2(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-kurikaeshi-kanji-2");
  if (!meta) throw new Error("manifest is missing the kh-kurikaeshi-kanji-2 rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhKurikaeshiKanji2 extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      const re = new RegExp(PATTERN.source, PATTERN.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const matched = m[0];
        // The last char is 々; the preceding chars are the kanji string
        // We only flag 々 itself (the erroneous mark), spanning just the last char
        const khPos = m.index + matched.length - 1;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `"々" should only repeat a single kanji. Rewrite without "々".`,
          messageJa: `標準 校正必携 第8版に基づき、「々」は漢字1字の繰り返しにのみ用います。2字以上の漢語全体の繰り返しに「々」を使うのは誤りです。`,
          from: khPos,
          to: khPos + 1,
          originalText: "々",
          reference: REFERENCE,
        });
      }
      return issues;
    }
  }

  return new KhKurikaeshiKanji2(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
