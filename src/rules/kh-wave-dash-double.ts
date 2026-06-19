/**
 * kh-wave-dash-double — 波ダーシ「〜」の重複
 *
 * 範囲・程度を示す波ダーシ「〜」（U+301C）は1個で使う。
 * 「〜〜」と2個以上続けるのは誤りである。
 *
 * 偽陽性回避:
 *   - 単独の「〜」は対象外。
 *   - 2個以上の連続のみを検出。
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
  section: "縦組の数詞表記の基準・数の幅を示す場合",
} as const;

// U+301C = wave dash 〜 (Japanese)
const PATTERN = /〜{2,}/gu;

export function createKhWaveDashDouble(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-wave-dash-double");
  if (!meta) throw new Error("manifest is missing the kh-wave-dash-double rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhWaveDashDouble extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      return toolkit.regexReplace({
        text,
        pattern: PATTERN,
        ruleId: this.id,
        severity: config.severity,
        message: "Use a single 〜 for ranges — do not double it.",
        messageJa: "標準 校正必携 第8版に基づき、範囲を示す波ダーシ「〜」は1個で使います。「〜〜」と重ねるのは誤りです。",
        replacement: () => "〜",
        fixLabelJa: "「〜」1個に修正",
        reference: REFERENCE,
      });
    }
  }

  return new KhWaveDashDouble(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
