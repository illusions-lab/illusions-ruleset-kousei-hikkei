/**
 * kh-leader-double — 三点リーダーは偶数個（2の倍数）で使う
 *
 * 校正実務の慣行として、三点リーダー「…」（U+2026）は「……」（2個）を
 * 一組として使う。1個（奇数個）のみの使用は誤りとみなす。
 *
 * 偽陽性回避:
 *   - 偶数個（2, 4, 6 …）は正しいので除外。
 *   - 1個、3個、5個 … の奇数個のみを検出する。
 *   - lookahead で「次が … でない」、lookbehind で「前が … でない」位置を特定。
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
  section: "組方原則および調整・区切り約物",
} as const;

export function createKhLeaderDouble(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-leader-double");
  if (!meta) throw new Error("manifest is missing the kh-leader-double rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhLeaderDouble extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      // Find runs of … and flag those with odd length
      const re = /…+/gu;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const run = m[0];
        if (run.length % 2 !== 0) {
          // Odd count — suggest rounding up to next even number
          const suggested = "…".repeat(run.length + 1);
          issues.push({
            ruleId: this.id,
            severity: config.severity,
            message: `Use an even number of … (found ${run.length}): suggest "${suggested}"`,
            messageJa: `標準 校正必携 第8版に基づき、三点リーダー「…」は偶数個（「${suggested}」など）でひと組として使います（現在${run.length}個）。`,
            from: m.index,
            to: m.index + run.length,
            originalText: run,
            reference: REFERENCE,
            fix: {
              label: `Replace with ${suggested}`,
              labelJa: `「${suggested}」に修正`,
              replacement: suggested,
            },
          });
        }
      }
      return issues;
    }
  }

  return new KhLeaderDouble(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
