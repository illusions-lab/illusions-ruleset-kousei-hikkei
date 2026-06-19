/**
 * kh-kurikaeshi-kana-ichi — かな一つ点「ゝ」の誤用
 *
 * 「ゝ」（U+309D）・「ヽ」（U+30FD）はかな書き語内で同音を1字繰り返す
 * ときにのみ用いる（例: かわいゝ→かわいい）。
 *
 * 一般的な現代文では「ゝ」「ヽ」はほぼ使われない。
 * 「文部省刊行物表記の基準（1950年）」では「々以外の繰り返し符号は
 * できるだけ使わないのが望ましい」とされている。
 *
 * 本ルールは「ゝ」「ヽ」の出現を警告し、明示的な文字表記への書き換えを促す。
 *
 * 偽陽性回避:
 *   - 古典物・引用・復刻では原文尊重が原則のため、このルールを無効化することを推奨。
 *   - 検出は出現のみ（fix は提供しない、文脈依存の書き換えが必要なため）。
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

// ゝ (U+309D) = hiragana iteration mark
// ヽ (U+30FD) = katakana iteration mark
const PATTERN = /[ゝヽ]/gu;

export function createKhKurikaeshiKanaIchi(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-kurikaeshi-kana-ichi");
  if (!meta) throw new Error("manifest is missing the kh-kurikaeshi-kana-ichi rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhKurikaeshiKanaIchi extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      const re = new RegExp(PATTERN.source, PATTERN.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Iteration mark "${m[0]}" should be written out explicitly in modern text.`,
          messageJa: `標準 校正必携 第8版に基づき、現代文では「ゝ」「ヽ」などのくり返し符号は「々」以外はできるだけ使わないのが望ましいとされています。明示的な文字表記への書き換えを検討してください。`,
          from: m.index,
          to: m.index + 1,
          originalText: m[0],
          reference: REFERENCE,
        });
      }
      return issues;
    }
  }

  return new KhKurikaeshiKanaIchi(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
