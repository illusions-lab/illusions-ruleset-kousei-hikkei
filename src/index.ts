/**
 * Ruleset entry point for 標準 校正必携 第8版 (Kousei Hikkei 8).
 *
 * - `manifest` is plain data loaded from manifest.json (read without running code).
 * - `createRules(ctx)` builds the concrete rules using SDK tools from `ctx`.
 *
 * Only `import type` from "illusions-lint-sdk"; runtime tools come via `ctx`.
 */
import type { RulesetContext, RulesetModule } from "illusions-lint-sdk";

import manifestJson from "../manifest.json";
import { createKhLeaderDouble } from "./rules/kh-leader-double";
import { createKhDashDouble } from "./rules/kh-dash-double";
import { createKhKurikaeshiKanji2 } from "./rules/kh-kurikaeshi-kanji-2";
import { createKhKurikaeshiKanaIchi } from "./rules/kh-kurikaeshi-kana-ichi";
import { createKhExclaimKuten } from "./rules/kh-exclaim-kuten";
import { createKhDoubleKuten } from "./rules/kh-double-kuten";
import { createKhTripleTouten } from "./rules/kh-triple-touten";
import { createKhWaveDashDouble } from "./rules/kh-wave-dash-double";
import { createKhMixedFwHwBracket } from "./rules/kh-mixed-fw-hw-bracket";
import { createKhNakaguroDouble } from "./rules/kh-nakaguro-double";

const manifest = manifestJson as RulesetModule["manifest"];

const ruleset: RulesetModule = {
  manifest,
  createRules(ctx: RulesetContext) {
    return [
      createKhLeaderDouble(ctx, manifest),
      createKhDashDouble(ctx, manifest),
      createKhKurikaeshiKanji2(ctx, manifest),
      createKhKurikaeshiKanaIchi(ctx, manifest),
      createKhExclaimKuten(ctx, manifest),
      createKhDoubleKuten(ctx, manifest),
      createKhTripleTouten(ctx, manifest),
      createKhWaveDashDouble(ctx, manifest),
      createKhMixedFwHwBracket(ctx, manifest),
      createKhNakaguroDouble(ctx, manifest),
    ];
  },
};

export default ruleset;
