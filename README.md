# AE Mover

Migrate your plug-ins, scripts, presets, and templates between After Effects versions — in one click.

**Free** | **10 Languages** | **AE 2022–2030**

---

## English

### What it does

AE Mover scans your source AE version and detects third-party items across 5 categories:

| Category | Method |
|----------|--------|
| **Plug-ins** (3rd party) | Report & open folders (manual copy — admin required) |
| **ScriptUI Panels** | Report & open folders (manual copy — admin required) |
| **Presets** (non-default) | Report & open folders (manual copy — admin required) |
| **User Presets** | Auto-copy with backup (no overwrites) |
| **Templates** | Auto-copy with backup (no overwrites) |

### Installation

1. Close After Effects
2. Copy the `AEMover` folder to:
   - **Windows**: `C:\Users\<you>\AppData\Roaming\Adobe\CEP\extensions\`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/`
3. Restart After Effects
4. Go to **Window > Extensions > AE Mover**

> If the panel doesn't appear, enable unsigned extensions:
> Open a terminal and run:
> ```
> # Windows (Command Prompt as Admin)
> reg add HKCU\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f
>
> # macOS
> defaults write com.adobe.CSXS.11 PlayerDebugMode 1
> ```
> Then restart AE.

### How to use

1. Select **Source** (old AE version) and **Target** (new AE version)
2. Review detected items and uncheck anything you don't want to migrate
3. Click **Migrate**
4. For Program Files items: source and target folders will open automatically — drag & drop the files you need
5. For Documents items: files are copied automatically with a backup created first

### Supported languages

English, Japanese, German, French, Spanish, Italian, Portuguese, Korean, Chinese (Simplified), Russian

The language is detected automatically from your AE interface language.

---

## 日本語

### 概要

AE Mover は、After Effects のバージョン間でサードパーティのプラグイン・スクリプト・プリセット・テンプレートを移行するための無料ツールです。

| カテゴリ | 方式 |
|----------|------|
| **プラグイン**（サードパーティ） | レポート表示 + フォルダ自動オープン（手動コピー） |
| **ScriptUI パネル** | レポート表示 + フォルダ自動オープン（手動コピー） |
| **プリセット**（カスタム） | レポート表示 + フォルダ自動オープン（手動コピー） |
| **ユーザープリセット** | 自動コピー（バックアップ付き・上書きなし） |
| **テンプレート** | 自動コピー（バックアップ付き・上書きなし） |

### インストール方法

1. After Effects を終了
2. `AEMover` フォルダを以下にコピー:
   - **Windows**: `C:\Users\<ユーザー名>\AppData\Roaming\Adobe\CEP\extensions\`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/`
3. After Effects を再起動
4. **ウィンドウ > エクステンション > AE Mover** を選択

> パネルが表示されない場合は、未署名エクステンションを有効にしてください:
> ```
> # Windows（管理者権限のコマンドプロンプト）
> reg add HKCU\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f
>
> # macOS
> defaults write com.adobe.CSXS.11 PlayerDebugMode 1
> ```
> AE を再起動してください。

### 使い方

1. **移行元**（旧バージョン）と**移行先**（新バージョン）を選択
2. 検出されたアイテムを確認し、移行しないものはチェックを外す
3. **移行開始** をクリック
4. Program Files のアイテム: 移行元・移行先のフォルダが自動で開きます。必要なファイルをドラッグ＆ドロップしてください
5. ドキュメントのアイテム: バックアップ作成後、自動でコピーされます

---

## 한국어

### 개요

AE Mover는 After Effects 버전 간에 서드파티 플러그인, 스크립트, 프리셋, 템플릿을 마이그레이션하는 무료 도구입니다.

| 카테고리 | 방식 |
|----------|------|
| **플러그인** (서드파티) | 보고서 + 폴더 자동 열기 (수동 복사) |
| **ScriptUI 패널** | 보고서 + 폴더 자동 열기 (수동 복사) |
| **프리셋** (사용자 정의) | 보고서 + 폴더 자동 열기 (수동 복사) |
| **사용자 프리셋** | 자동 복사 (백업 포함, 덮어쓰기 없음) |
| **템플릿** | 자동 복사 (백업 포함, 덮어쓰기 없음) |

### 설치 방법

1. After Effects 종료
2. `AEMover` 폴더를 다음 경로에 복사:
   - **Windows**: `C:\Users\<사용자>\AppData\Roaming\Adobe\CEP\extensions\`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/`
3. After Effects 재시작
4. **Window > Extensions > AE Mover** 선택

> 패널이 나타나지 않으면 서명되지 않은 확장을 활성화하세요:
> ```
> # Windows (관리자 권한 명령 프롬프트)
> reg add HKCU\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f
>
> # macOS
> defaults write com.adobe.CSXS.11 PlayerDebugMode 1
> ```

### 사용 방법

1. **소스** (이전 버전)와 **대상** (새 버전) 선택
2. 감지된 항목을 확인하고 마이그레이션하지 않을 항목의 체크 해제
3. **마이그레이션** 클릭
4. Program Files 항목: 소스와 대상 폴더가 자동으로 열립니다. 필요한 파일을 드래그 앤 드롭하세요
5. Documents 항목: 백업 생성 후 자동으로 복사됩니다

---

## 简体中文

### 概述

AE Mover 是一款免费工具，用于在 After Effects 版本之间迁移第三方插件、脚本、预设和模板。

| 类别 | 方式 |
|------|------|
| **插件**（第三方） | 报告 + 自动打开文件夹（手动复制） |
| **ScriptUI 面板** | 报告 + 自动打开文件夹（手动复制） |
| **预设**（自定义） | 报告 + 自动打开文件夹（手动复制） |
| **用户预设** | 自动复制（含备份，不覆盖） |
| **模板** | 自动复制（含备份，不覆盖） |

### 安装方法

1. 关闭 After Effects
2. 将 `AEMover` 文件夹复制到：
   - **Windows**: `C:\Users\<用户名>\AppData\Roaming\Adobe\CEP\extensions\`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/`
3. 重启 After Effects
4. 选择 **窗口 > 扩展 > AE Mover**

> 如果面板未显示，请启用未签名扩展：
> ```
> # Windows（以管理员身份运行命令提示符）
> reg add HKCU\Software\Adobe\CSXS.11 /v PlayerDebugMode /t REG_SZ /d 1 /f
>
> # macOS
> defaults write com.adobe.CSXS.11 PlayerDebugMode 1
> ```

### 使用方法

1. 选择**源**（旧版本）和**目标**（新版本）
2. 查看检测到的项目，取消勾选不需要迁移的项目
3. 点击**开始迁移**
4. Program Files 项目：源文件夹和目标文件夹将自动打开，请拖放所需文件
5. Documents 项目：创建备份后自动复制

---

## License

Free to use. Made by [InovativeWorks](https://aescripts.com/authors/i/inovativeworks).
