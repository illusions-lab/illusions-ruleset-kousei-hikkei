/**
 * kh-kurikaeshi-kana-ichi — かな一つ点「ゝ」「ヽ」の使用（現代文では避けることを推奨）
 *
 * 「ゝ」（U+309D）・「ヽ」（U+30FD）は、標準 校正必携 第8版（くり返し符号の使い方）によると
 * かな書きの一語の中で同音を繰り返すときにのみ用いる正用法がある。
 * ただし同書は「々」以外のくり返し符号は現代文ではできるだけ使わないことが望ましいとも述べている
 * （1950年文部省刊行物表記の基準による）。
 *
 * 本ルールは「ゝ」「ヽ」の出現を情報提供（info）として通知し、書き手が
 * 現代表記への書き換えを検討できるようにする。
 * 語内の正用（かわいゝ→かわいい）も含め全件検出するため、
 * 古典物・引用・復刻では無効化を推奨。
 *
 * 偽陽性回避:
 *   - 検出は出現のみ（fix は提供しない、文脈依存の書き換えが必要なため）。
 *   - severity は info（断定的な警告ではない）。
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
          message: `Iteration mark "${m[0]}" found — modern text convention avoids ゝ/ヽ; consider writing it out explicitly.`,
          messageJa: `標準 校正必携 第8版に基づき、現代文では「ゝ」「ヽ」などのくり返し符号は「々」以外はできるだけ使わないのが望ましいとされています。語内の同音繰り返し（かわいゝ等）は正用ですが、明示的な文字表記への書き換えを検討してください。`,
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
