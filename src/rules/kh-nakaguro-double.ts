/**
 * kh-nakaguro-double — 中黒「・」の重複
 *
 * 並列の中黒「・」（U+30FB）が2個以上連続するのは誤りである。
 * 1個のみが正しい使い方。
 *
 * 偽陽性回避:
 *   - 単独の「・」は対象外。
 *   - 2個以上の連続のみを検出。
 *   - 半角中黒「･」（U+FF65）も同様に検出。
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
  section: "組方原則および調整・中点類",
} as const;

// U+30FB = katakana middle dot ・, U+FF65 = halfwidth katakana middle dot ･
const PATTERN = /[・･]{2,}/gu;

export function createKhNakaguroDouble(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-nakaguro-double");
  if (!meta) throw new Error("manifest is missing the kh-nakaguro-double rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhNakaguroDouble extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      return toolkit.regexReplace({
        text,
        pattern: PATTERN,
        ruleId: this.id,
        severity: config.severity,
        message: "Duplicate '・' — use only one middle dot.",
        messageJa: "標準 校正必携 第8版に基づき、中黒「・」の重複は誤りです。中黒は1個のみ使います。",
        replacement: () => "・",
        fixLabelJa: "中黒を1個に修正",
        reference: REFERENCE,
      });
    }
  }

  return new KhNakaguroDouble(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
