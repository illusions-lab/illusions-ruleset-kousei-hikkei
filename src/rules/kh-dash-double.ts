/**
 * kh-dash-double — 全角ダーシは2個続けて使う
 *
 * 校正実務の慣行として、全角ダーシ「—」（U+2014）は単独では用いず、
 * 必ず「——」（2個）をひと組として使う。
 *
 * 偽陽性回避:
 *   - 偶数個（2, 4 …）の連続は正しい表記として除外。
 *   - 奇数個（1, 3 …）のみを検出する。
 *   - ハイフン「-」（U+002D）や二分ダーシ「–」（U+2013）は対象外。
 *   - 「——」の一部として組まれた 4 個連続なども偶数のため除外。
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

export function createKhDashDouble(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-dash-double");
  if (!meta) throw new Error("manifest is missing the kh-dash-double rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhDashDouble extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      // Find runs of em-dash (U+2014) and flag those with odd length
      const re = /—+/gu;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const run = m[0];
        if (run.length % 2 !== 0) {
          const suggested = "—".repeat(run.length + 1);
          issues.push({
            ruleId: this.id,
            severity: config.severity,
            message: `Use an even number of — (found ${run.length}): suggest "${suggested}"`,
            messageJa: `標準 校正必携 第8版に基づき、全角ダーシ「—」は偶数個（「${suggested}」など）でひと組として使います（現在${run.length}個）。`,
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

  return new KhDashDouble(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
