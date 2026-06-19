/**
 * kh-dash-double — 全角ダーシは2個続けて使う（小説・公用文）
 *
 * 小説・公用文などで区切りや言いさしに全角ダーシ「—」（U+2014）を使う場合、
 * 「——」（2個をひと組）が標準の校正実務慣行。
 * 標準 校正必携 第8版（組方原則および調整・区切り約物）に基づき
 * 二倍（2個）を単位として扱う。数の幅表示でも全角ダーシ2個が用いられる。
 *
 * severity は info とし断定しない（文脈によっては単独使用もありうるため）。
 *
 * 偽陽性回避:
 *   - 偶数個（2, 4 …）の連続は正しい表記として除外。
 *   - 奇数個（1, 3 …）のみを検出する。
 *   - ハイフン「-」（U+002D）や二分ダーシ「–」（U+2013）は対象外。
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
            message: `Odd count of — (found ${run.length}): novel/official convention uses pairs — suggest "${suggested}"`,
            messageJa: `標準 校正必携 第8版に基づき、小説・公用文では全角ダーシ「—」は偶数個（「${suggested}」など）でひと組として使うのが標準です（現在${run.length}個）。`,
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
