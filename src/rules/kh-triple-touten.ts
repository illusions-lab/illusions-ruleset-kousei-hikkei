/**
 * kh-triple-touten — 読点の過多（3個以上の連続）
 *
 * 読点「、」が3個以上連続している場合、文の構成を見直すことを促す。
 * 読点の過多は文章の読みにくさや構成の問題を示すことが多い。
 *
 * 偽陽性回避:
 *   - 1〜2個の連続は対象外（2個連続は列挙などで許容されうる）。
 *   - 3個以上の連続のみを検出。
 *   - fix は提供しない（書き換えは文脈依存のため）。
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
  section: "組方原則および調整・句読点",
} as const;

const PATTERN = /、{3,}/gu;

export function createKhTripleTouten(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-triple-touten");
  if (!meta) throw new Error("manifest is missing the kh-triple-touten rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhTripleTouten extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      const issues: LintIssue[] = [];
      const re = new RegExp(PATTERN.source, PATTERN.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        issues.push({
          ruleId: this.id,
          severity: config.severity,
          message: `${m[0].length} consecutive "、" — consider restructuring the sentence.`,
          messageJa: `標準 校正必携 第8版に基づき、読点「、」が${m[0].length}個連続しています。文の構成を見直して読点を減らすことを検討してください。`,
          from: m.index,
          to: m.index + m[0].length,
          originalText: m[0],
          reference: REFERENCE,
        });
      }
      return issues;
    }
  }

  return new KhTripleTouten(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
