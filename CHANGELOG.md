# Changelog

すべての重要な変更をこのファイルに記録します。
形式は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に準拠し、
[Semantic Versioning](https://semver.org/lang/ja/) を採用します。

## [Unreleased]

## [0.4.0] - 2026-06-20

### Changed

- `kh-leader-double`（三点リーダー偶数個ルール）の `applicableModes` に `academic` を追加。学術書でも「……」2個組の慣行が適用されるため。
- `kh-dash-double`（全角ダーシ2個組ルール）の `applicableModes` に `academic` を追加。学術文書においても「——」2個組の慣行が適用されるため。
- `nameJa` および `descriptionJa` の対象モード記述を「小説・公用文・学術」に更新。
- `package.json` の `name` をテンプレート残り (`illusions-ruleset-template`) から正式名称 (`illusions-ruleset-kousei-hikkei`) に修正。

## [0.1.0] - 〔YYYY-MM-DD〕

### Added

- 初版。`sample-fw-exclaim` ルールを追加。
