/**
 * kh-leader-double — 三点リーダーは偶数個（2の倍数）で使う（小説・公用文）
 *
 * 小説・公用文などの本文中では「……」（2個をひと組）が標準の校正実務慣行。
 * 標準 校正必携 第8版（組方原則および調整・区切り約物）に基づき
 * 二倍（2個）を単位として扱う。
 *
 * 数式文脈では単独使用の例もあるため、severity は info とし断定しない。
 *
 * 偽陽性回避:
 *   - 偶数個（2, 4, 6 …）は正しいので除外。
 *   - 1個、3個、5個 … の奇数個のみを検出する。
 *   - applicableModes は novel/official のみ（数式用途を排除）。
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
            message: `Odd count of … (found ${run.length}): small-novel convention uses pairs — suggest "${suggested}"`,
            messageJa: `標準 校正必携 第8版に基づき、小説・公用文では三点リーダー「…」は偶数個（「${suggested}」など）でひと組として使うのが標準です（現在${run.length}個）。数式・索引など記号用途では単独使用も許容されます。`,
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
