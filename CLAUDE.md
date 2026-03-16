# AE Mover — Claude Code コンテキスト

> 最終更新: 2026-03-16 (GitHub公開・リリースZIP作成完了)
> 用途: Claude Codeでの開発作業時に参照する製品固有情報
> GitHub: https://github.com/InovativeWorks/AEMover

---

## 0. 安全ルール

- 親ディレクトリの `E:\InovativeWorks\CLAUDE.md` セクション0を遵守
- Program Files 配下への書き込みは CEP では不可（管理者権限必須）
- ユーザーのプリセット/テンプレートを操作するため、**バックアップ → コピー** の順序を厳守
- `copyFileSync` は上書きしない（既存ファイルはスキップ）

---

## 1. プロジェクト概要

- **製品名**: AE Mover
- **種別**: CEP パネル型エクステンション（無料配布）
- **価格**: $0（name-your-price）
- **販売チャネル**: aescripts + aeplugins
- **用途**: After Effects バージョン間でユーザー設定（プラグイン・スクリプト・プリセット・テンプレート）を移行するユーティリティ
- **対応AE**: AE 2022 (v22.x) 〜 AE 2030 (v30.x)
- **対応OS**: Windows（macOS は未テスト、パス処理は対応済み）
- **対応言語**: 10言語（en, ja, de, fr, es, it, pt, ko, zh, ru）— AE UIロケール自動検出

### 5カテゴリ移行方式

| カテゴリ | 場所 | 方式 | 理由 |
|----------|------|------|------|
| Plug-ins (3rd party) | Program Files | レポート + フォルダ自動オープン | 管理者権限必須 |
| ScriptUI Panels | Program Files | レポート + フォルダ自動オープン | 管理者権限必須 |
| Presets (non-default) | Program Files | レポート + フォルダ自動オープン | 管理者権限必須 |
| User Presets | Documents | 自動コピー（バックアップ付き） | ユーザー権限で書き込み可能 |
| Templates | Documents | 自動コピー（バックアップ付き） | ユーザー権限で書き込み可能 |

---

## 2. ディレクトリ構成

```
E:\InovativeWorks\products\AEMover\
├── CLAUDE.md              ← このファイル
├── .debug                 ← CEP デバッグフラグ
├── .gitignore
├── package.json
├── CSInterface.js         ← ルートCSInterface（レガシー互換）
├── CSXS/
│   └── manifest.xml       ← CEP拡張マニフェスト（BundleId: AEMover）
├── index.html             ← パネルUI（HTML/CSS + data-i18n属性）
├── js/
│   ├── i18n.js            ← 多言語対応（10言語・AEロケール自動検出・t()関数）
│   ├── main.js            ← メインロジック（バージョン検出・スキャン・移行処理）
│   └── libs/
│       └── CSInterface.js ← Adobe CSInterface ライブラリ
└── jsx/
    └── hostscript.jsx     ← ExtendScript（最小限・AEバージョン取得のみ）
```

---

## 3. 技術スタック

| レイヤー | 技術 | 備考 |
|----------|------|------|
| UI | HTML / CSS / JavaScript | CEP パネル（300×500px） |
| ロジック | Node.js (CEP統合) | `fs`, `path`, `os`, `child_process` 使用 |
| AE連携 | ExtendScript (ES3) | `hostscript.jsx`（バージョン取得のみ） |
| i18n | 自前実装 `i18n.js` | `CSInterface.getHostEnvironment().appUILocale` で言語検出 |
| ダイアログ | カスタムモーダル | `showConfirm()` (OK/Cancel) / `showAlert()` (OK only) |
| CEPランタイム | CSXS 11.0 | AE 2022+ 対応 |
| バージョン管理 | Git | master ブランチ |

### 主要な技術的判断

- **ネイティブ `confirm()` を使わない**: CEP の confirm ダイアログはテキストが見切れるため、カスタムモーダルに置き換え
- **バージョン検出は3ソース**: Program Files + Documents/Adobe + AppData/Roaming を順にスキャン。いずれか1つでも見つかれば検出
- **Program Files への書き込みは行わない**: CEP は管理者権限を持てないため、レポート + フォルダオープンで手動コピーを案内
- **Documents への自動コピーは必ずバックアップを先に作成**: `_backup_YYYYMMDD_HHMMSS` サフィックスでタイムスタンプ付き

---

## 4. 現在のステータス

### バージョン: v1.0.0（リリース準備完了）

### 完了済み機能

| 機能 | コミット | 日付 |
|------|----------|------|
| CEP パネル基盤（HTML/CSS/JS + ExtendScript） | `02a08f2` | 2026-03-13 |
| 5カテゴリ移行（Program Files レポート方式 + Documents 自動コピー方式） | `e96dad8` | 2026-03-13 |
| 3ソースバージョン検出（Program Files / Documents / AppData） | `9fb9e9e` | 2026-03-13 |
| AE 2026 (v26.x) 対応 | `9fb9e9e` | 2026-03-13 |
| i18n 対応（10言語: en, ja, de, fr, es, it, pt, ko, zh, ru） | `0df0cb7` | 2026-03-16 |
| カスタムモーダルダイアログ（confirm / alert） | `0df0cb7` | 2026-03-16 |
| Program Files 項目のフォルダ自動オープン | `0df0cb7` | 2026-03-16 |
| 手動コピーガイダンスアラート（管理者権限の説明） | `0df0cb7` | 2026-03-16 |
| デフォルトプラグイン/プリセット/スクリプト除外フィルター | `e96dad8` | 2026-03-13 |
| バックアップ付き自動コピー（上書きなし） | `e96dad8` | 2026-03-13 |
| Open ボタンによる手動フォルダオープン | `e96dad8` | 2026-03-13 |
| 詳細ログ出力（レポート + コピー結果） | `e96dad8` | 2026-03-13 |
| README 4言語版（en/ja/ko/zh） | `1070bae` | 2026-03-16 |
| リリース ZIP 作成（AEMover_v1.0.0.zip） | `1070bae` | 2026-03-16 |
| GitHub リポジトリ公開 | `1070bae` | 2026-03-16 |

### Git 履歴

```
1070bae Add README (en/ja/ko/zh) and release prep (2026-03-16)
6d3169e Add product-level CLAUDE.md for AE Mover (2026-03-16)
0df0cb7 Add i18n support (10 languages), custom modal dialogs, and manual copy guidance (2026-03-16)
9fb9e9e Fix version detection: triple-source scan + cache busting (2026-03-13)
e96dad8 Redesign: Program Files detection + report/open-folders approach (2026-03-13)
02a08f2 Add AE Mover v1.0 CEP extension (2026-03-13)
```

### リリース成果物

- **GitHub**: https://github.com/InovativeWorks/AEMover
- **ZIP**: `release/AEMover_v1.0.0.zip` (44KB) — `.git`, `.debug`, `node_modules`, `CLAUDE.md` 等を除外済み

---

## 5. 次のマイルストーン

### v1.0.0 リリース（aescripts 提出）

- [ ] AE 2024 → AE 2026 の実機移行テスト（全5カテゴリ）
- [ ] ZXP ビルド + 署名
- [ ] aescripts プロダクトページ作成（英語）
- [ ] プロモ素材（スクリーンショット 5-8枚）
- [ ] GitHub Releases にリリースタグ + ZIP 添付
- [ ] aescripts 提出・審査

### v1.1 以降

- [ ] macOS 実機テスト（`/Applications` + `~/Documents/Adobe`）
- [ ] i18n: it/pt/ko/zh/ru の未翻訳キーを全て埋める
- [ ] AE 2025+ 共有 Documents フォルダ対応の検証
- [ ] Aescripts ライセンスフレームワーク統合（ダウンロード数トラッキング用）

---

## 6. 既知の制限事項

| 制限 | 理由 | 回避策 |
|------|------|--------|
| Program Files への自動コピー不可 | CEP は管理者権限を持てない | レポート表示 + フォルダ自動オープンで手動コピーを案内 |
| .aex プラグインのバージョン互換性は保証しない | AE バージョン間で ABI が異なる | ログで警告表示 + ベンダーサイト確認を推奨 |
| macOS 未テスト | 開発環境が Windows のみ | パス処理は `os.platform()` 分岐済みだが実機検証なし |
| i18n: it/pt/ko/zh/ru は主要キーのみ翻訳済み | 開発優先度 | 未翻訳キーは英語にフォールバック |
| AE 2017 以前は非対応 | CSXS 11.0 (AE 2022+) 必須 + majorToYear マッピングが 2018〜 | 対応予定なし（EOL バージョン） |
| バージョン検出で年の重複排除あり | 同一年の複数インストール（CC/非CC混在）はマージされる | 実用上問題なし（同年は同バージョン） |

---

## 7. 開発メモ

### CEP デバッグ

- `.debug` ファイルが存在する状態で AE を起動するとデバッグモードになる
- Chrome DevTools: `localhost:8088`（ポートは `.debug` 内で指定）
- シンボリックリンク先: `%APPDATA%\Adobe\CEP\extensions\AEMover`

### デフォルト除外リスト

以下はAE標準同梱のため移行対象から除外される:

- **プラグインフォルダ**: `(adobepsl)`, `cineware by maxon`, `effects`, `extensions`, `format`, `keyframe`
- **プリセットフォルダ**: `adobe express`, `backgrounds`, `behaviors`, `image - creative`, `image - special effects`, `image - utilities`, `legacy`, `shapes`, `sound effects`, `synthetics`, `text`, `transitions - dissolves`, `transitions - movement`, `transitions - wipes`
- **スクリプト**: `about the scriptui panels folder.txt`, `create nulls from paths.jsx`, `vr comp editor.jsx`

### バージョン番号マッピング

```
15→2018, 16→2019, 17→2020, 18→2021,
22→2022, 23→2023, 24→2024, 25→2025, 26→2026,
27→2027, 28→2028, 29→2029, 30→2030
```

※ v19〜21 は欠番（AE 2022 で v22 にジャンプ）
