/**
 * kh-double-kuten — 句点の重複（「。。」）
 *
 * 句点「。」が2個以上連続する場合は誤りである。
 * 1個の句点のみが正しい。
 *
 * 偽陽性回避:
 *   - 「。」が単独の場合は対象外。
 *   - 「。。」以上の連続のみを検出。
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

const PATTERN = /。{2,}/gu;

export function createKhDoubleKuten(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-double-kuten");
  if (!meta) throw new Error("manifest is missing the kh-double-kuten rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhDoubleKuten extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      return toolkit.regexReplace({
        text,
        pattern: PATTERN,
        ruleId: this.id,
        severity: config.severity,
        message: "Duplicate '。' — use only one sentence-ending period.",
        messageJa: "標準 校正必携 第8版に基づき、句点「。」の重複は誤りです。句点は1個のみ使います。",
        replacement: () => "。",
        fixLabelJa: "句点を1個に修正",
        reference: REFERENCE,
      });
    }
  }

  return new KhDoubleKuten(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
