/**
 * kh-exclaim-kuten — 感嘆符・疑問符の直後に句点は不要
 *
 * 「！」「？」（および半角 "!" "?"）はそれ自体が文末符号の機能を持つため、
 * 直後に句点「。」を重ねるのは誤りである。
 *
 * 偽陽性回避:
 *   - 「！。」「？。」の形のみを検出。「！」単独・「？」単独は対象外。
 *   - 全角・半角どちらの感嘆符/疑問符も対象とする。
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

// Full-width and half-width exclamation/question marks followed by Japanese period
const PATTERN = /([！!？?])。/gu;

export function createKhExclaimKuten(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "kh-exclaim-kuten");
  if (!meta) throw new Error("manifest is missing the kh-exclaim-kuten rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class KhExclaimKuten extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      return toolkit.regexReplace({
        text,
        pattern: PATTERN,
        ruleId: this.id,
        severity: config.severity,
        message: "Remove '。' after '！'/'？' — punctuation mark already ends the sentence.",
        messageJa: `標準 校正必携 第8版に基づき、感嘆符・疑問符（！・？）は文末の機能を持つため、直後に句点「。」を重ねる必要はありません。`,
        replacement: (m) => m[1],
        fixLabelJa: "句点「。」を削除",
        reference: REFERENCE,
      });
    }
  }

  return new KhExclaimKuten(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
