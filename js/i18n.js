/**
 * AE Mover — Internationalization (i18n)
 *
 * Detects AE UI language via CSInterface and provides t(key, ...args).
 * Fallback: English.
 */

(function () {
    'use strict';

    // ── Locale Detection ────────────────────────────────────
    var _locale = 'en';

    try {
        var cs = new CSInterface();
        var appLocale = cs.getHostEnvironment().appUILocale || '';
        // appUILocale returns e.g. "ja_JP", "en_US", "de_DE", "zh_CN"
        _locale = appLocale.split('_')[0].toLowerCase() || 'en';
    } catch (e) {
        _locale = 'en';
    }

    // ── Translation Dictionaries ────────────────────────────

    var locales = {};

    // ── English (base / fallback) ───────────────────────────
    locales.en = {
        // HTML static
        'label.source': 'Source:',
        'label.target': 'Target:',
        'section.itemsFound': 'Items found in source:',
        'group.programFiles': 'Program Files',
        'group.documents': 'Documents',
        'badge.report': 'report',
        'badge.autoCopy': 'auto-copy',
        'cat.plugins': 'Plug-ins (3rd party)',
        'cat.scripts': 'ScriptUI Panels',
        'cat.presets': 'Presets (non-default)',
        'cat.userPresets': 'User Presets',
        'cat.templates': 'Templates',
        'btn.open': 'Open',
        'btn.migrate': '\u25B6 Migrate',
        'btn.working': 'Working...',
        'label.log': 'Log:',
        'log.placeholder': 'Select source and target versions above.',
        'footer.explore': 'Explore more tools by InovativeWorks',

        // Dropdowns
        'dd.selectSource': '-- Select Source --',
        'dd.selectTarget': '-- Select Target --',
        'dd.noVersions': 'No AE versions found',

        // Validation
        'warn.sameVersion': 'Source and Target must be different versions.',

        // Counts
        'count.files': '{0} files',
        'count.totalFiles': 'Total: {0} files',
        'count.subfolders': '({0} subfolders)',

        // Confirm dialog
        'confirm.reportLabel': '\uD83D\uDD0D REPORT: {0}',
        'confirm.reportDesc': '   Missing items will be listed. Both folders will be opened for manual copy.',
        'confirm.autoCopyLabel': '\uD83D\uDCE6 AUTO-COPY: {0}',
        'confirm.autoCopyDesc': '   Files will be copied automatically (backup first, no overwrites).',
        'confirm.proceed': 'Proceed?',
        'modal.ok': 'OK',
        'modal.cancel': 'Cancel',

        // Migration warnings
        'migrate.noCategories': 'No categories selected.',
        'migrate.nothingToMigrate': 'Nothing to migrate (0 files in selected categories).',

        // Log — Report section
        'log.reportHeader': 'MISSING ITEMS REPORT (manual copy needed)',
        'log.pluginsHeader': '\u25A0 Plug-ins (3rd party)',
        'log.scriptsHeader': '\u25A0 ScriptUI Panels',
        'log.presetsHeader': '\u25A0 Presets (non-default)',
        'log.missingInTarget': '{0} \u2014 missing in target',
        'log.filesNeedCopying': '\u2192 {0} files in {1} folder(s) need copying',
        'log.filesNeedCopyingSimple': '\u2192 {0} file(s) need copying',
        'log.allPluginsExist': '\u2713 All plug-in folders already exist in target',
        'log.allScriptsExist': '\u2713 All scripts already exist in target',
        'log.allPresetsExist': '\u2713 All presets already exist in target',
        'log.filesAlreadyPresent': '\u2713 {0} files already present',
        'log.aexWarning': '\u26A0 Plug-ins (.aex) may not be compatible across AE versions.',
        'log.aexAdvice': '  Check vendor sites for version compatibility before copying.',

        // Log — Auto-copy section
        'log.autoCopyHeader': 'AUTO-COPY (Documents)',
        'log.backupFailed': '\u2717 Backup failed: {0}',
        'log.backupSuccess': '\u2713 Backup: {0} \u2192 {1}',
        'log.copyResult': '\u2713 {0}: {1}/{2} copied',
        'log.skipped': '  \u26A0 Skipped: {0} (exists)',
        'log.autoCopyDone': 'Auto-copy done: {0} copied, {1} skipped, {2} errors.',
        'log.done': 'Done!',

        // Program Files manual copy alert
        'alert.manualCopyTitle': 'Manual Copy Required',
        'alert.manualCopyBody': 'The items listed above are located in Program Files, which requires administrator privileges to modify.\n\nThe source and target folders have been opened for you.\nPlease review the report in the log, then drag & drop the needed files between the folders.\n\nNote: Some plug-ins (.aex) may need a version update from the vendor.',
        'log.openingFolders': 'Opening folders...',
        'log.openedFolders': '\u2713 Opened: {0}',

        // Init log
        'log.scanPaths': 'Scan paths: {0}',
        'log.scanPathsNone': '(none found)',
        'log.documents': 'Documents: {0}',
        'log.detectedVersions': 'Detected {0} version(s):',
        'log.refreshed': 'Refreshed.',
    };

    // ── Japanese ────────────────────────────────────────────
    locales.ja = {
        'label.source': '移行元:',
        'label.target': '移行先:',
        'section.itemsFound': '移行元で検出されたアイテム:',
        'group.programFiles': 'Program Files',
        'group.documents': 'ドキュメント',
        'badge.report': 'レポート',
        'badge.autoCopy': '自動コピー',
        'cat.plugins': 'プラグイン（サードパーティ）',
        'cat.scripts': 'ScriptUI パネル',
        'cat.presets': 'プリセット（カスタム）',
        'cat.userPresets': 'ユーザープリセット',
        'cat.templates': 'テンプレート',
        'btn.open': '開く',
        'btn.migrate': '\u25B6 移行開始',
        'btn.working': '処理中...',
        'label.log': 'ログ:',
        'log.placeholder': '上のドロップダウンから移行元と移行先を選択してください。',
        'footer.explore': 'InovativeWorks の他のツールもチェック',

        'dd.selectSource': '-- 移行元を選択 --',
        'dd.selectTarget': '-- 移行先を選択 --',
        'dd.noVersions': 'AE バージョンが見つかりません',

        'warn.sameVersion': '移行元と移行先は異なるバージョンを選択してください。',

        'count.files': '{0} ファイル',
        'count.totalFiles': '合計: {0} ファイル',
        'count.subfolders': '({0} サブフォルダ)',

        'confirm.reportLabel': '\uD83D\uDD0D レポート: {0}',
        'confirm.reportDesc': '   不足アイテムを一覧表示します。手動コピー用に両方のフォルダを開きます。',
        'confirm.autoCopyLabel': '\uD83D\uDCE6 自動コピー: {0}',
        'confirm.autoCopyDesc': '   ファイルを自動コピーします（バックアップ後、上書きなし）。',
        'confirm.proceed': '実行しますか？',
        'modal.ok': 'OK',
        'modal.cancel': 'キャンセル',

        'migrate.noCategories': 'カテゴリが選択されていません。',
        'migrate.nothingToMigrate': '移行対象がありません（選択カテゴリのファイル数: 0）。',

        'log.reportHeader': '不足アイテムレポート（手動コピーが必要）',
        'log.pluginsHeader': '\u25A0 プラグイン（サードパーティ）',
        'log.scriptsHeader': '\u25A0 ScriptUI パネル',
        'log.presetsHeader': '\u25A0 プリセット（カスタム）',
        'log.missingInTarget': '{0} \u2014 移行先に存在しません',
        'log.filesNeedCopying': '\u2192 {1} フォルダ内の {0} ファイルをコピーしてください',
        'log.filesNeedCopyingSimple': '\u2192 {0} ファイルをコピーしてください',
        'log.allPluginsExist': '\u2713 すべてのプラグインフォルダが移行先に存在します',
        'log.allScriptsExist': '\u2713 すべてのスクリプトが移行先に存在します',
        'log.allPresetsExist': '\u2713 すべてのプリセットが移行先に存在します',
        'log.filesAlreadyPresent': '\u2713 {0} ファイルは既に存在',
        'log.aexWarning': '\u26A0 プラグイン (.aex) は AE バージョン間で互換性がない場合があります。',
        'log.aexAdvice': '  コピー前にベンダーサイトでバージョン互換性を確認してください。',

        'log.autoCopyHeader': '自動コピー（ドキュメント）',
        'log.backupFailed': '\u2717 バックアップ失敗: {0}',
        'log.backupSuccess': '\u2713 バックアップ: {0} \u2192 {1}',
        'log.copyResult': '\u2713 {0}: {1}/{2} コピー完了',
        'log.skipped': '  \u26A0 スキップ: {0}（既に存在）',
        'log.autoCopyDone': '自動コピー完了: {0} コピー, {1} スキップ, {2} エラー。',
        'log.done': '完了！',

        'alert.manualCopyTitle': '手動コピーのご案内',
        'alert.manualCopyBody': '上記のアイテムは Program Files 内にあるため、管理者権限が必要です。\n\n移行元と移行先のフォルダを開きました。\nログのレポートを確認し、必要なファイルをフォルダ間でコピーしてください。\n\nご注意: 一部のプラグイン (.aex) はベンダーからバージョン対応版の入手が必要な場合があります。',
        'log.openingFolders': 'フォルダを開いています...',
        'log.openedFolders': '\u2713 開きました: {0}',

        'log.scanPaths': 'スキャンパス: {0}',
        'log.scanPathsNone': '（なし）',
        'log.documents': 'ドキュメント: {0}',
        'log.detectedVersions': '{0} バージョン検出:',
        'log.refreshed': '更新しました。',
    };

    // ── German ──────────────────────────────────────────────
    locales.de = {
        'label.source': 'Quelle:',
        'label.target': 'Ziel:',
        'section.itemsFound': 'In der Quelle gefundene Elemente:',
        'group.documents': 'Dokumente',
        'badge.report': 'Bericht',
        'badge.autoCopy': 'Auto-Kopie',
        'cat.plugins': 'Plug-ins (Drittanbieter)',
        'cat.presets': 'Vorgaben (benutzerdefiniert)',
        'cat.userPresets': 'Benutzervorgaben',
        'cat.templates': 'Vorlagen',
        'btn.open': '\u00D6ffnen',
        'btn.migrate': '\u25B6 Migration starten',
        'btn.working': 'Arbeitet...',
        'label.log': 'Protokoll:',
        'log.placeholder': 'W\u00E4hlen Sie oben Quell- und Zielversion aus.',
        'footer.explore': 'Entdecken Sie weitere Tools von InovativeWorks',
        'dd.selectSource': '-- Quelle w\u00E4hlen --',
        'dd.selectTarget': '-- Ziel w\u00E4hlen --',
        'dd.noVersions': 'Keine AE-Versionen gefunden',
        'warn.sameVersion': 'Quelle und Ziel m\u00FCssen unterschiedliche Versionen sein.',
        'count.files': '{0} Dateien',
        'count.totalFiles': 'Gesamt: {0} Dateien',
        'count.subfolders': '({0} Unterordner)',
        'confirm.reportLabel': '\uD83D\uDD0D BERICHT: {0}',
        'confirm.reportDesc': '   Fehlende Elemente werden aufgelistet. Beide Ordner werden ge\u00F6ffnet.',
        'confirm.autoCopyLabel': '\uD83D\uDCE6 AUTO-KOPIE: {0}',
        'confirm.autoCopyDesc': '   Dateien werden automatisch kopiert (Backup zuerst, kein \u00DCberschreiben).',
        'confirm.proceed': 'Fortfahren?',
        'modal.cancel': 'Abbrechen',
        'migrate.noCategories': 'Keine Kategorien ausgew\u00E4hlt.',
        'migrate.nothingToMigrate': 'Nichts zu migrieren (0 Dateien in ausgew\u00E4hlten Kategorien).',
        'log.reportHeader': 'BERICHT \u00DCBER FEHLENDE ELEMENTE (manuelles Kopieren erforderlich)',
        'log.pluginsHeader': '\u25A0 Plug-ins (Drittanbieter)',
        'log.presetsHeader': '\u25A0 Vorgaben (benutzerdefiniert)',
        'log.missingInTarget': '{0} \u2014 fehlt im Ziel',
        'log.filesNeedCopying': '\u2192 {0} Dateien in {1} Ordner(n) m\u00FCssen kopiert werden',
        'log.filesNeedCopyingSimple': '\u2192 {0} Datei(en) m\u00FCssen kopiert werden',
        'log.allPluginsExist': '\u2713 Alle Plug-in-Ordner existieren bereits im Ziel',
        'log.allScriptsExist': '\u2713 Alle Skripte existieren bereits im Ziel',
        'log.allPresetsExist': '\u2713 Alle Vorgaben existieren bereits im Ziel',
        'log.filesAlreadyPresent': '\u2713 {0} Dateien bereits vorhanden',
        'log.aexWarning': '\u26A0 Plug-ins (.aex) sind m\u00F6glicherweise nicht zwischen AE-Versionen kompatibel.',
        'log.aexAdvice': '  Pr\u00FCfen Sie die Versionskompatibilit\u00E4t auf den Herstellerseiten.',
        'log.autoCopyHeader': 'AUTO-KOPIE (Dokumente)',
        'log.backupFailed': '\u2717 Backup fehlgeschlagen: {0}',
        'log.backupSuccess': '\u2713 Backup: {0} \u2192 {1}',
        'log.copyResult': '\u2713 {0}: {1}/{2} kopiert',
        'log.skipped': '  \u26A0 \u00DCbersprungen: {0} (existiert)',
        'log.autoCopyDone': 'Auto-Kopie abgeschlossen: {0} kopiert, {1} \u00FCbersprungen, {2} Fehler.',
        'log.done': 'Fertig!',
        'log.scanPaths': 'Suchpfade: {0}',
        'log.scanPathsNone': '(keine gefunden)',
        'log.documents': 'Dokumente: {0}',
        'log.detectedVersions': '{0} Version(en) erkannt:',
        'log.refreshed': 'Aktualisiert.',
    };

    // ── French ──────────────────────────────────────────────
    locales.fr = {
        'label.source': 'Source :',
        'label.target': 'Cible :',
        'section.itemsFound': '\u00C9l\u00E9ments trouv\u00E9s dans la source :',
        'group.documents': 'Documents',
        'badge.report': 'rapport',
        'badge.autoCopy': 'copie auto',
        'cat.plugins': 'Plug-ins (tiers)',
        'cat.presets': 'Param\u00E8tres pr\u00E9d\u00E9finis (personnalis\u00E9s)',
        'cat.userPresets': 'Param\u00E8tres utilisateur',
        'cat.templates': 'Mod\u00E8les',
        'btn.open': 'Ouvrir',
        'btn.migrate': '\u25B6 Migrer',
        'btn.working': 'En cours...',
        'label.log': 'Journal :',
        'log.placeholder': 'S\u00E9lectionnez les versions source et cible ci-dessus.',
        'footer.explore': 'D\u00E9couvrez d\'autres outils par InovativeWorks',
        'dd.selectSource': '-- S\u00E9lectionner la source --',
        'dd.selectTarget': '-- S\u00E9lectionner la cible --',
        'dd.noVersions': 'Aucune version d\'AE trouv\u00E9e',
        'warn.sameVersion': 'La source et la cible doivent \u00EAtre des versions diff\u00E9rentes.',
        'count.files': '{0} fichiers',
        'count.totalFiles': 'Total : {0} fichiers',
        'count.subfolders': '({0} sous-dossiers)',
        'confirm.reportLabel': '\uD83D\uDD0D RAPPORT : {0}',
        'confirm.reportDesc': '   Les \u00E9l\u00E9ments manquants seront list\u00E9s. Les deux dossiers seront ouverts.',
        'confirm.autoCopyLabel': '\uD83D\uDCE6 COPIE AUTO : {0}',
        'confirm.autoCopyDesc': '   Les fichiers seront copi\u00E9s automatiquement (sauvegarde d\'abord, pas d\'\u00E9crasement).',
        'confirm.proceed': 'Continuer ?',
        'modal.cancel': 'Annuler',
        'migrate.noCategories': 'Aucune cat\u00E9gorie s\u00E9lectionn\u00E9e.',
        'migrate.nothingToMigrate': 'Rien \u00E0 migrer (0 fichiers dans les cat\u00E9gories s\u00E9lectionn\u00E9es).',
        'log.reportHeader': 'RAPPORT DES \u00C9L\u00C9MENTS MANQUANTS (copie manuelle n\u00E9cessaire)',
        'log.pluginsHeader': '\u25A0 Plug-ins (tiers)',
        'log.presetsHeader': '\u25A0 Param\u00E8tres pr\u00E9d\u00E9finis (personnalis\u00E9s)',
        'log.missingInTarget': '{0} \u2014 absent de la cible',
        'log.filesNeedCopying': '\u2192 {0} fichiers dans {1} dossier(s) \u00E0 copier',
        'log.filesNeedCopyingSimple': '\u2192 {0} fichier(s) \u00E0 copier',
        'log.allPluginsExist': '\u2713 Tous les dossiers de plug-ins existent d\u00E9j\u00E0 dans la cible',
        'log.allScriptsExist': '\u2713 Tous les scripts existent d\u00E9j\u00E0 dans la cible',
        'log.allPresetsExist': '\u2713 Tous les param\u00E8tres existent d\u00E9j\u00E0 dans la cible',
        'log.filesAlreadyPresent': '\u2713 {0} fichiers d\u00E9j\u00E0 pr\u00E9sents',
        'log.aexWarning': '\u26A0 Les plug-ins (.aex) peuvent ne pas \u00EAtre compatibles entre les versions d\'AE.',
        'log.aexAdvice': '  V\u00E9rifiez la compatibilit\u00E9 sur les sites des fournisseurs avant de copier.',
        'log.autoCopyHeader': 'COPIE AUTO (Documents)',
        'log.backupFailed': '\u2717 \u00C9chec de la sauvegarde : {0}',
        'log.backupSuccess': '\u2713 Sauvegarde : {0} \u2192 {1}',
        'log.copyResult': '\u2713 {0} : {1}/{2} copi\u00E9(s)',
        'log.skipped': '  \u26A0 Ignor\u00E9 : {0} (existe)',
        'log.autoCopyDone': 'Copie auto termin\u00E9e : {0} copi\u00E9(s), {1} ignor\u00E9(s), {2} erreur(s).',
        'log.done': 'Termin\u00E9 !',
        'log.scanPaths': 'Chemins de recherche : {0}',
        'log.scanPathsNone': '(aucun trouv\u00E9)',
        'log.documents': 'Documents : {0}',
        'log.detectedVersions': '{0} version(s) d\u00E9tect\u00E9e(s) :',
        'log.refreshed': 'Actualis\u00E9.',
    };

    // ── Spanish ─────────────────────────────────────────────
    locales.es = {
        'label.source': 'Origen:',
        'label.target': 'Destino:',
        'section.itemsFound': 'Elementos encontrados en el origen:',
        'group.documents': 'Documentos',
        'badge.report': 'informe',
        'badge.autoCopy': 'copia auto',
        'cat.plugins': 'Plug-ins (terceros)',
        'cat.presets': 'Ajustes preestablecidos (personalizados)',
        'cat.userPresets': 'Ajustes de usuario',
        'cat.templates': 'Plantillas',
        'btn.open': 'Abrir',
        'btn.migrate': '\u25B6 Migrar',
        'btn.working': 'Procesando...',
        'label.log': 'Registro:',
        'log.placeholder': 'Seleccione las versiones de origen y destino arriba.',
        'footer.explore': 'Descubre m\u00E1s herramientas de InovativeWorks',
        'dd.selectSource': '-- Seleccionar origen --',
        'dd.selectTarget': '-- Seleccionar destino --',
        'dd.noVersions': 'No se encontraron versiones de AE',
        'warn.sameVersion': 'El origen y el destino deben ser versiones diferentes.',
        'count.files': '{0} archivos',
        'count.totalFiles': 'Total: {0} archivos',
        'count.subfolders': '({0} subcarpetas)',
        'confirm.reportLabel': '\uD83D\uDD0D INFORME: {0}',
        'confirm.reportDesc': '   Se listar\u00E1n los elementos faltantes. Se abrir\u00E1n ambas carpetas.',
        'confirm.autoCopyLabel': '\uD83D\uDCE6 COPIA AUTO: {0}',
        'confirm.autoCopyDesc': '   Los archivos se copiar\u00E1n autom\u00E1ticamente (respaldo primero, sin sobrescribir).',
        'confirm.proceed': '\u00BFContinuar?',
        'modal.cancel': 'Cancelar',
        'migrate.noCategories': 'No se seleccionaron categor\u00EDas.',
        'migrate.nothingToMigrate': 'Nada que migrar (0 archivos en las categor\u00EDas seleccionadas).',
        'log.reportHeader': 'INFORME DE ELEMENTOS FALTANTES (copia manual necesaria)',
        'log.pluginsHeader': '\u25A0 Plug-ins (terceros)',
        'log.presetsHeader': '\u25A0 Ajustes preestablecidos (personalizados)',
        'log.missingInTarget': '{0} \u2014 falta en el destino',
        'log.filesNeedCopying': '\u2192 {0} archivos en {1} carpeta(s) necesitan copiarse',
        'log.filesNeedCopyingSimple': '\u2192 {0} archivo(s) necesitan copiarse',
        'log.allPluginsExist': '\u2713 Todas las carpetas de plug-ins ya existen en el destino',
        'log.allScriptsExist': '\u2713 Todos los scripts ya existen en el destino',
        'log.allPresetsExist': '\u2713 Todos los ajustes ya existen en el destino',
        'log.filesAlreadyPresent': '\u2713 {0} archivos ya presentes',
        'log.aexWarning': '\u26A0 Los plug-ins (.aex) pueden no ser compatibles entre versiones de AE.',
        'log.aexAdvice': '  Verifique la compatibilidad en los sitios de los fabricantes antes de copiar.',
        'log.autoCopyHeader': 'COPIA AUTO (Documentos)',
        'log.backupFailed': '\u2717 Error en respaldo: {0}',
        'log.backupSuccess': '\u2713 Respaldo: {0} \u2192 {1}',
        'log.copyResult': '\u2713 {0}: {1}/{2} copiados',
        'log.skipped': '  \u26A0 Omitido: {0} (existe)',
        'log.autoCopyDone': 'Copia auto completada: {0} copiados, {1} omitidos, {2} errores.',
        'log.done': '\u00A1Listo!',
        'log.scanPaths': 'Rutas de b\u00FAsqueda: {0}',
        'log.scanPathsNone': '(ninguna encontrada)',
        'log.documents': 'Documentos: {0}',
        'log.detectedVersions': '{0} versi\u00F3n(es) detectada(s):',
        'log.refreshed': 'Actualizado.',
    };

    // ── Italian ─────────────────────────────────────────────
    locales.it = {
        'label.source': 'Origine:',
        'label.target': 'Destinazione:',
        'section.itemsFound': 'Elementi trovati nell\'origine:',
        'group.documents': 'Documenti',
        'badge.report': 'rapporto',
        'badge.autoCopy': 'copia auto',
        'cat.plugins': 'Plug-in (terze parti)',
        'cat.presets': 'Predefiniti (personalizzati)',
        'cat.userPresets': 'Predefiniti utente',
        'cat.templates': 'Modelli',
        'btn.open': 'Apri',
        'btn.migrate': '\u25B6 Migra',
        'btn.working': 'In corso...',
        'label.log': 'Registro:',
        'log.placeholder': 'Seleziona le versioni di origine e destinazione sopra.',
        'dd.selectSource': '-- Seleziona origine --',
        'dd.selectTarget': '-- Seleziona destinazione --',
        'dd.noVersions': 'Nessuna versione di AE trovata',
        'warn.sameVersion': 'Origine e destinazione devono essere versioni diverse.',
        'count.files': '{0} file',
        'count.totalFiles': 'Totale: {0} file',
        'count.subfolders': '({0} sottocartelle)',
        'confirm.proceed': 'Procedere?',
        'modal.cancel': 'Annulla',
        'migrate.noCategories': 'Nessuna categoria selezionata.',
        'migrate.nothingToMigrate': 'Niente da migrare (0 file nelle categorie selezionate).',
        'log.done': 'Fatto!',
        'log.refreshed': 'Aggiornato.',
    };

    // ── Portuguese (Brazil) ─────────────────────────────────
    locales.pt = {
        'label.source': 'Origem:',
        'label.target': 'Destino:',
        'section.itemsFound': 'Itens encontrados na origem:',
        'group.documents': 'Documentos',
        'badge.report': 'relat\u00F3rio',
        'badge.autoCopy': 'c\u00F3pia auto',
        'cat.plugins': 'Plug-ins (terceiros)',
        'cat.presets': 'Predefini\u00E7\u00F5es (personalizadas)',
        'cat.userPresets': 'Predefini\u00E7\u00F5es do usu\u00E1rio',
        'cat.templates': 'Modelos',
        'btn.open': 'Abrir',
        'btn.migrate': '\u25B6 Migrar',
        'btn.working': 'Processando...',
        'label.log': 'Log:',
        'log.placeholder': 'Selecione as vers\u00F5es de origem e destino acima.',
        'dd.selectSource': '-- Selecionar origem --',
        'dd.selectTarget': '-- Selecionar destino --',
        'dd.noVersions': 'Nenhuma vers\u00E3o do AE encontrada',
        'warn.sameVersion': 'Origem e destino devem ser vers\u00F5es diferentes.',
        'count.files': '{0} arquivos',
        'count.totalFiles': 'Total: {0} arquivos',
        'count.subfolders': '({0} subpastas)',
        'confirm.proceed': 'Continuar?',
        'modal.cancel': 'Cancelar',
        'migrate.noCategories': 'Nenhuma categoria selecionada.',
        'migrate.nothingToMigrate': 'Nada para migrar (0 arquivos nas categorias selecionadas).',
        'log.done': 'Conclu\u00EDdo!',
        'log.refreshed': 'Atualizado.',
    };

    // ── Korean ──────────────────────────────────────────────
    locales.ko = {
        'label.source': '\uC18C\uC2A4:',
        'label.target': '\uB300\uC0C1:',
        'section.itemsFound': '\uC18C\uC2A4\uC5D0\uC11C \uBC1C\uACAC\uB41C \uD56D\uBAA9:',
        'group.documents': '\uBB38\uC11C',
        'badge.report': '\uBCF4\uACE0\uC11C',
        'badge.autoCopy': '\uC790\uB3D9 \uBCF5\uC0AC',
        'cat.plugins': '\uD50C\uB7EC\uADF8\uC778 (\uD0C0\uC0AC)',
        'cat.scripts': 'ScriptUI \uD328\uB110',
        'cat.presets': '\uD504\uB9AC\uC14B (\uC0AC\uC6A9\uC790 \uC815\uC758)',
        'cat.userPresets': '\uC0AC\uC6A9\uC790 \uD504\uB9AC\uC14B',
        'cat.templates': '\uD15C\uD50C\uB9BF',
        'btn.open': '\uC5F4\uAE30',
        'btn.migrate': '\u25B6 \uB9C8\uC774\uADF8\uB808\uC774\uC158',
        'btn.working': '\uCC98\uB9AC \uC911...',
        'label.log': '\uB85C\uADF8:',
        'log.placeholder': '\uC704\uC5D0\uC11C \uC18C\uC2A4\uC640 \uB300\uC0C1 \uBC84\uC804\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
        'dd.selectSource': '-- \uC18C\uC2A4 \uC120\uD0DD --',
        'dd.selectTarget': '-- \uB300\uC0C1 \uC120\uD0DD --',
        'dd.noVersions': 'AE \uBC84\uC804\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
        'warn.sameVersion': '\uC18C\uC2A4\uC640 \uB300\uC0C1\uC740 \uB2E4\uB978 \uBC84\uC804\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.',
        'count.files': '{0}\uAC1C \uD30C\uC77C',
        'count.totalFiles': '\uCD1D: {0}\uAC1C \uD30C\uC77C',
        'count.subfolders': '({0}\uAC1C \uD558\uC704 \uD3F4\uB354)',
        'confirm.proceed': '\uC9C4\uD589\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        'modal.cancel': '\uCDE8\uC18C',
        'migrate.noCategories': '\uCE74\uD14C\uACE0\uB9AC\uAC00 \uC120\uD0DD\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.',
        'migrate.nothingToMigrate': '\uB9C8\uC774\uADF8\uB808\uC774\uC158\uD560 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4 (\uC120\uD0DD\uB41C \uCE74\uD14C\uACE0\uB9AC\uC5D0 0\uAC1C \uD30C\uC77C).',
        'log.done': '\uC644\uB8CC!',
        'log.refreshed': '\uC5C5\uB370\uC774\uD2B8\uB428.',
    };

    // ── Chinese Simplified ──────────────────────────────────
    locales.zh = {
        'label.source': '\u6E90:',
        'label.target': '\u76EE\u6807:',
        'section.itemsFound': '\u5728\u6E90\u4E2D\u627E\u5230\u7684\u9879\u76EE:',
        'group.documents': '\u6587\u6863',
        'badge.report': '\u62A5\u544A',
        'badge.autoCopy': '\u81EA\u52A8\u590D\u5236',
        'cat.plugins': '\u63D2\u4EF6\uFF08\u7B2C\u4E09\u65B9\uFF09',
        'cat.scripts': 'ScriptUI \u9762\u677F',
        'cat.presets': '\u9884\u8BBE\uFF08\u81EA\u5B9A\u4E49\uFF09',
        'cat.userPresets': '\u7528\u6237\u9884\u8BBE',
        'cat.templates': '\u6A21\u677F',
        'btn.open': '\u6253\u5F00',
        'btn.migrate': '\u25B6 \u5F00\u59CB\u8FC1\u79FB',
        'btn.working': '\u5904\u7406\u4E2D...',
        'label.log': '\u65E5\u5FD7:',
        'log.placeholder': '\u8BF7\u5728\u4E0A\u65B9\u9009\u62E9\u6E90\u7248\u672C\u548C\u76EE\u6807\u7248\u672C\u3002',
        'dd.selectSource': '-- \u9009\u62E9\u6E90 --',
        'dd.selectTarget': '-- \u9009\u62E9\u76EE\u6807 --',
        'dd.noVersions': '\u672A\u627E\u5230 AE \u7248\u672C',
        'warn.sameVersion': '\u6E90\u548C\u76EE\u6807\u5FC5\u987B\u662F\u4E0D\u540C\u7684\u7248\u672C\u3002',
        'count.files': '{0} \u4E2A\u6587\u4EF6',
        'count.totalFiles': '\u5408\u8BA1: {0} \u4E2A\u6587\u4EF6',
        'count.subfolders': '({0} \u4E2A\u5B50\u6587\u4EF6\u5939)',
        'confirm.proceed': '\u7EE7\u7EED\uFF1F',
        'modal.cancel': '\u53D6\u6D88',
        'migrate.noCategories': '\u672A\u9009\u62E9\u4EFB\u4F55\u7C7B\u522B\u3002',
        'migrate.nothingToMigrate': '\u6CA1\u6709\u53EF\u8FC1\u79FB\u7684\u5185\u5BB9\uFF08\u6240\u9009\u7C7B\u522B\u4E2D\u6709 0 \u4E2A\u6587\u4EF6\uFF09\u3002',
        'log.done': '\u5B8C\u6210\uFF01',
        'log.refreshed': '\u5DF2\u5237\u65B0\u3002',
    };

    // ── Russian ─────────────────────────────────────────────
    locales.ru = {
        'label.source': '\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A:',
        'label.target': '\u0426\u0435\u043B\u044C:',
        'section.itemsFound': '\u042D\u043B\u0435\u043C\u0435\u043D\u0442\u044B, \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0435 \u0432 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0435:',
        'group.documents': '\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B',
        'badge.report': '\u043E\u0442\u0447\u0451\u0442',
        'badge.autoCopy': '\u0430\u0432\u0442\u043E\u043A\u043E\u043F\u0438\u044F',
        'cat.plugins': '\u041F\u043B\u0430\u0433\u0438\u043D\u044B (\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u0438\u0435)',
        'cat.scripts': 'ScriptUI \u043F\u0430\u043D\u0435\u043B\u0438',
        'cat.presets': '\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 (\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435)',
        'cat.userPresets': '\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438',
        'cat.templates': '\u0428\u0430\u0431\u043B\u043E\u043D\u044B',
        'btn.open': '\u041E\u0442\u043A\u0440\u044B\u0442\u044C',
        'btn.migrate': '\u25B6 \u041C\u0438\u0433\u0440\u0430\u0446\u0438\u044F',
        'btn.working': '\u0412\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u0442\u0441\u044F...',
        'label.log': '\u0416\u0443\u0440\u043D\u0430\u043B:',
        'log.placeholder': '\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0435\u0440\u0441\u0438\u0438 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430 \u0438 \u0446\u0435\u043B\u0438 \u0432\u044B\u0448\u0435.',
        'dd.selectSource': '-- \u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A --',
        'dd.selectTarget': '-- \u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0446\u0435\u043B\u044C --',
        'dd.noVersions': '\u0412\u0435\u0440\u0441\u0438\u0438 AE \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B',
        'warn.sameVersion': '\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0438 \u0446\u0435\u043B\u044C \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u0440\u0430\u0437\u043D\u044B\u043C\u0438 \u0432\u0435\u0440\u0441\u0438\u044F\u043C\u0438.',
        'count.files': '{0} \u0444\u0430\u0439\u043B\u043E\u0432',
        'count.totalFiles': '\u0412\u0441\u0435\u0433\u043E: {0} \u0444\u0430\u0439\u043B\u043E\u0432',
        'count.subfolders': '({0} \u043F\u043E\u0434\u043F\u0430\u043F\u043E\u043A)',
        'confirm.proceed': '\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C?',
        'modal.cancel': '\u041E\u0442\u043C\u0435\u043D\u0430',
        'migrate.noCategories': '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u043D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u044B.',
        'migrate.nothingToMigrate': '\u041D\u0435\u0447\u0435\u0433\u043E \u043C\u0438\u0433\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C (0 \u0444\u0430\u0439\u043B\u043E\u0432 \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F\u0445).',
        'log.done': '\u0413\u043E\u0442\u043E\u0432\u043E!',
        'log.refreshed': '\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E.',
    };

    // ── t() — Translation Function ──────────────────────────

    var _dict = locales[_locale] || locales.en;
    var _fallback = locales.en;

    /**
     * Translate a key with optional placeholder arguments.
     * t('count.files', 42) → "42 files"
     */
    function t(key) {
        var template = _dict[key] || _fallback[key] || key;
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length === 0) return template;
        return template.replace(/\{(\d+)\}/g, function (match, idx) {
            var i = parseInt(idx, 10);
            return i < args.length ? args[i] : match;
        });
    }

    /**
     * Apply translations to elements with data-i18n attribute.
     */
    function applyLocale() {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            el.textContent = t(el.getAttribute('data-i18n'));
        });
        // Modal buttons
        var okBtn = document.getElementById('confirm-modal-ok');
        var cancelBtn = document.getElementById('confirm-modal-cancel');
        if (okBtn) okBtn.textContent = t('modal.ok');
        if (cancelBtn) cancelBtn.textContent = t('modal.cancel');
    }

    // ── Expose globally ─────────────────────────────────────
    window.t = t;
    window.applyLocale = applyLocale;
    window._aeMoverLocale = _locale;

})();
