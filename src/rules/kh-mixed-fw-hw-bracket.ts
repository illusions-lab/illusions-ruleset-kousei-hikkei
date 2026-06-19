/**
 * kh-mixed-fw-hw-bracket — 全角括弧と半角括弧の混在
 *
 * 開き括弧が全角「（」で閉じが半角「)」、またはその逆の場合は誤りである。
 * 括弧の開きと閉じは同じ種類（全角同士または半角同士）で統一する。
 *
 * 偽陽性回避:
 *   - ネスト括弧（入れ子）は対象外。
 *   - 同行内の直近の開き/閉じの組み合わせのみを検出。
 *   - 全角開き + 半角閉じ、半角開き + 全角閉じ の2パターンを検出。
 *   - 括弧内容は最長でも200文字以内の単純なケースのみ対象とする。
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
  section: "組方原則および調整・括弧類",
} as const;

// Full-width open + half-width close
const FW_OPEN_HW_CLOSE = /（([^（）()]{0,200}?)\)/gu;
// Half-width open + full-width close
const HW_OPEN_FW_CLOSE = /\(([^（）()]{0,200}?)）/gu;

export function createKhMixedFwHwBracket(
  ctx: RulesetContext,
  manifest: RulesetManifest,
): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-mixed-fw-hw-bracket");
  if (!meta) throw new Error("manifest is missing the kh-mixed-fw-hw-bracket rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhMixedFwHwBracket extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];

      // Pattern 1: 全角開き（ + content + 半角閉じ)
      const re1 = new RegExp(FW_OPEN_HW_CLOSE.source, FW_OPEN_HW_CLOSE.flags);
      let m: RegExpExecArray | null;
      while ((m = re1.exec(text)) !== null) {
        const inner = m[1];
        const suggested = `（${inner}）`;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Mismatched brackets: full-width open "（" with half-width close ")" — use "（${inner}）"`,
          messageJa: `標準 校正必携 第8版に基づき、括弧の開きと閉じは同じ種類で統一します。全角開き「（」に対して閉じは全角「）」を使います。`,
          from: m.index,
          to: m.index + m[0].length,
          originalText: m[0],
          reference: REFERENCE,
          fix: {
            label: `Replace with ${suggested}`,
            labelJa: `「${suggested}」に修正`,
            replacement: suggested,
          },
        });
      }

      // Pattern 2: 半角開き( + content + 全角閉じ）
      const re2 = new RegExp(HW_OPEN_FW_CLOSE.source, HW_OPEN_FW_CLOSE.flags);
      while ((m = re2.exec(text)) !== null) {
        const inner = m[1];
        const suggested = `(${inner})`;
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `Mismatched brackets: half-width open "(" with full-width close "）" — use "(${inner})"`,
          messageJa: `標準 校正必携 第8版に基づき、括弧の開きと閉じは同じ種類で統一します。半角開き「(」に対して閉じは半角「)」を使います。`,
          from: m.index,
          to: m.index + m[0].length,
          originalText: m[0],
          reference: REFERENCE,
          fix: {
            label: `Replace with ${suggested}`,
            labelJa: `「${suggested}」に修正`,
            replacement: suggested,
          },
        });
      }

      return toolkit.dedupe(issues).sort((a, b) => a.from - b.from);
    }
  }

  return new KhMixedFwHwBracket(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
