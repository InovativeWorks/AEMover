/**
 * AE Mover — Main Application Logic
 *
 * Program Files items (Plug-ins, Scripts, Presets):
 *   → Detect & report only. "Open Folders" button for manual copy.
 *   → CEP cannot write to Program Files (requires Admin).
 *
 * Documents items (User Presets, Templates):
 *   → Auto-copy with backup & skip-duplicates safety.
 *
 * Runs in CEP Node.js environment.
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const { exec } = require('child_process');

    const csInterface = new CSInterface();

    // ── State ──────────────────────────────────────────────
    let detectedVersions = [];
    let sourceVersion = null;
    let targetVersion = null;
    let scanResult = null;
    let isMigrating = false;

    // ── Constants ──────────────────────────────────────────

    // Default Adobe plugin folders — ship with AE, do NOT report
    const DEFAULT_PLUGIN_FOLDERS = new Set([
        '(adobepsl)', 'cineware by maxon', 'effects', 'extensions', 'format', 'keyframe'
    ]);

    // Default preset folders that ship with AE
    const DEFAULT_PRESET_FOLDERS = new Set([
        'adobe express', 'backgrounds', 'behaviors', 'image - creative',
        'image - special effects', 'image - utilities', 'legacy', 'shapes',
        'sound effects', 'synthetics', 'text', 'transitions - dissolves',
        'transitions - movement', 'transitions - wipes'
    ]);

    // Default scripts that ship with AE
    const DEFAULT_SCRIPTS = new Set([
        'about the scriptui panels folder.txt',
        'create nulls from paths.jsx',
        'vr comp editor.jsx'
    ]);

    // ── Path Helpers ───────────────────────────────────────

    function getProgramFilesDirs() {
        if (os.platform() === 'win32') {
            // CEP Node.js may not have environment variables — try multiple paths
            const candidates = [];
            if (process.env['ProgramFiles']) candidates.push(process.env['ProgramFiles']);
            candidates.push('C:\\Program Files');
            candidates.push('D:\\Program Files');
            // Deduplicate
            const seen = new Set();
            return candidates.filter(function (p) {
                const norm = p.toLowerCase().replace(/\//g, '\\');
                if (seen.has(norm)) return false;
                seen.add(norm);
                return fs.existsSync(p);
            });
        } else {
            return ['/Applications'];
        }
    }

    function getDocumentsDir() {
        return path.join(os.homedir(), 'Documents');
    }

    function getVersionPaths(version) {
        const sf = version.supportFilesDir;
        const dd = version.docsDir;
        return {
            pluginsDir: sf ? path.join(sf, 'Plug-ins') : null,
            scriptsDir: sf ? path.join(sf, 'Scripts', 'ScriptUI Panels') : null,
            presetsDir: sf ? path.join(sf, 'Presets') : null,
            userPresetsDir: dd ? path.join(dd, 'User Presets') : null,
            templatesDir: dd ? path.join(dd, 'Templates') : null,
        };
    }

    function openFolder(folderPath) {
        if (!folderPath || !fs.existsSync(folderPath)) return;
        if (os.platform() === 'win32') {
            exec('explorer "' + folderPath.replace(/\//g, '\\') + '"');
        } else {
            exec('open "' + folderPath + '"');
        }
    }

    // ── Version Detection ──────────────────────────────────

    function detectVersions() {
        const versions = [];
        const seenYears = new Set();
        const aePattern = /^(?:Adobe )?After Effects(?:\s+CC)?\s+(20\d{2})$/i;

        // ── Source 1: Program Files installations ──
        const pfDirs = getProgramFilesDirs();
        pfDirs.forEach(function (pfDir) {
            const adobeDir = path.join(pfDir, 'Adobe');
            if (!fs.existsSync(adobeDir)) return;

            let entries;
            try { entries = fs.readdirSync(adobeDir); } catch (e) { return; }

            entries.forEach(function (entry) {
                const match = entry.match(aePattern);
                if (!match) return;

                const fullPath = path.join(adobeDir, entry);
                try { if (!fs.statSync(fullPath).isDirectory()) return; } catch (e) { return; }

                const year = match[1];
                if (seenYears.has(year)) return;

                const supportFiles = path.join(fullPath, 'Support Files');
                const hasSupportFiles = fs.existsSync(supportFiles);

                seenYears.add(year);
                const yearNum = parseInt(year, 10);
                const majorVersion = yearNum <= 2021 ? yearNum - 2003 : yearNum - 2000;

                versions.push({
                    year: year,
                    installDir: fullPath,
                    supportFilesDir: hasSupportFiles ? supportFiles : null,
                    docsDir: findDocsDir(year),
                    majorVersion: majorVersion,
                    label: 'After Effects ' + year + ' (v' + majorVersion + '.x)'
                });
            });
        });

        // ── Source 2: Documents/Adobe folders (catch versions not in Program Files) ──
        const adobeDocs = path.join(getDocumentsDir(), 'Adobe');
        if (fs.existsSync(adobeDocs)) {
            try {
                fs.readdirSync(adobeDocs).forEach(function (entry) {
                    const match = entry.match(aePattern);
                    if (!match) return;

                    const year = match[1];
                    if (seenYears.has(year)) return;

                    const fullPath = path.join(adobeDocs, entry);
                    try { if (!fs.statSync(fullPath).isDirectory()) return; } catch (e) { return; }

                    seenYears.add(year);
                    const yearNum = parseInt(year, 10);
                    const majorVersion = yearNum <= 2021 ? yearNum - 2003 : yearNum - 2000;

                    versions.push({
                        year: year,
                        installDir: null,
                        supportFilesDir: null,
                        docsDir: fullPath,
                        majorVersion: majorVersion,
                        label: 'After Effects ' + year + ' (v' + majorVersion + '.x)'
                    });
                });
            } catch (e) { /* skip */ }
        }

        // ── Source 3: AppData version folders (catch modern shared-folder versions) ──
        const appDataDir = (function () {
            if (os.platform() === 'win32') {
                return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
                    'Adobe', 'After Effects');
            }
            return path.join(os.homedir(), 'Library', 'Preferences', 'Adobe', 'After Effects');
        })();

        if (fs.existsSync(appDataDir)) {
            try {
                const verPattern = /^(\d+)\.\d/;
                const majorToYear = {
                    15: '2018', 16: '2019', 17: '2020', 18: '2021',
                    22: '2022', 23: '2023', 24: '2024', 25: '2025', 26: '2026',
                    27: '2027', 28: '2028', 29: '2029', 30: '2030'
                };
                const appDataMajors = new Set();

                fs.readdirSync(appDataDir).forEach(function (entry) {
                    const match = entry.match(verPattern);
                    if (!match) return;
                    try { if (!fs.statSync(path.join(appDataDir, entry)).isDirectory()) return; } catch (e) { return; }
                    appDataMajors.add(parseInt(match[1], 10));
                });

                appDataMajors.forEach(function (major) {
                    const year = majorToYear[major] || (major + 2000).toString();
                    if (seenYears.has(year)) return;
                    seenYears.add(year);

                    // Try to find Program Files install for this version
                    let installDir = null, supportFilesDir = null;
                    pfDirs.forEach(function (pfDir) {
                        if (installDir) return;
                        const candidates = [
                            path.join(pfDir, 'Adobe', 'Adobe After Effects ' + year),
                            path.join(pfDir, 'Adobe', 'Adobe After Effects CC ' + year)
                        ];
                        candidates.forEach(function (c) {
                            if (!installDir && fs.existsSync(c)) {
                                installDir = c;
                                const sf = path.join(c, 'Support Files');
                                if (fs.existsSync(sf)) supportFilesDir = sf;
                            }
                        });
                    });

                    versions.push({
                        year: year,
                        installDir: installDir,
                        supportFilesDir: supportFilesDir,
                        docsDir: findDocsDir(year),
                        majorVersion: major,
                        label: 'After Effects ' + year + ' (v' + major + '.x)'
                    });
                });
            } catch (e) { /* skip */ }
        }

        versions.sort(function (a, b) { return a.majorVersion - b.majorVersion; });
        return versions;
    }

    function findDocsDir(year) {
        const adobeDocs = path.join(getDocumentsDir(), 'Adobe');
        if (!fs.existsSync(adobeDocs)) return null;

        const candidates = ['After Effects CC ' + year, 'After Effects ' + year];
        for (let i = 0; i < candidates.length; i++) {
            const p = path.join(adobeDocs, candidates[i]);
            if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
        }

        const shared = path.join(adobeDocs, 'After Effects');
        if (fs.existsSync(shared) && fs.statSync(shared).isDirectory()) return shared;
        return null;
    }

    // ── File Scanning ──────────────────────────────────────

    function scanDirectory(dirPath) {
        const result = { files: [], subfolderCount: 0 };
        if (!dirPath || !fs.existsSync(dirPath)) return result;

        function walk(currentDir, relativeBase) {
            let entries;
            try { entries = fs.readdirSync(currentDir); } catch (e) { return; }

            entries.forEach(function (entry) {
                const fullPath = path.join(currentDir, entry);
                const relativePath = relativeBase ? path.join(relativeBase, entry) : entry;
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        if (relativeBase === '') result.subfolderCount++;
                        walk(fullPath, relativePath);
                    } else if (stat.isFile()) {
                        result.files.push({ relativePath, fullPath, size: stat.size });
                    }
                } catch (e) { /* skip */ }
            });
        }

        walk(dirPath, '');
        return result;
    }

    /**
     * Scan third-party plugins (folders not in DEFAULT_PLUGIN_FOLDERS).
     */
    function scanPlugins(pluginsDir) {
        const result = { files: [], subfolderCount: 0, folders: [] };
        if (!pluginsDir || !fs.existsSync(pluginsDir)) return result;

        let entries;
        try { entries = fs.readdirSync(pluginsDir); } catch (e) { return result; }

        entries.forEach(function (entry) {
            if (DEFAULT_PLUGIN_FOLDERS.has(entry.toLowerCase())) return;
            const fullPath = path.join(pluginsDir, entry);
            try { if (!fs.statSync(fullPath).isDirectory()) return; } catch (e) { return; }

            result.folders.push(entry);
            result.subfolderCount++;
            const scan = scanDirectory(fullPath);
            scan.files.forEach(function (f) {
                result.files.push({
                    relativePath: path.join(entry, f.relativePath),
                    fullPath: f.fullPath,
                    size: f.size
                });
            });
        });

        return result;
    }

    /**
     * Scan user-installed ScriptUI Panels (exclude defaults).
     */
    function scanScripts(scriptsDir) {
        const result = { files: [], subfolderCount: 0 };
        if (!scriptsDir || !fs.existsSync(scriptsDir)) return result;

        let entries;
        try { entries = fs.readdirSync(scriptsDir); } catch (e) { return result; }

        entries.forEach(function (entry) {
            if (DEFAULT_SCRIPTS.has(entry.toLowerCase())) return;
            const fullPath = path.join(scriptsDir, entry);
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    result.subfolderCount++;
                    const scan = scanDirectory(fullPath);
                    scan.files.forEach(function (f) {
                        result.files.push({
                            relativePath: path.join(entry, f.relativePath),
                            fullPath: f.fullPath, size: f.size
                        });
                    });
                } else if (stat.isFile()) {
                    result.files.push({ relativePath: entry, fullPath, size: stat.size });
                }
            } catch (e) { /* skip */ }
        });

        return result;
    }

    /**
     * Scan non-default presets from Support Files/Presets.
     */
    function scanPresets(presetsDir) {
        const result = { files: [], subfolderCount: 0, folders: [] };
        if (!presetsDir || !fs.existsSync(presetsDir)) return result;

        let entries;
        try { entries = fs.readdirSync(presetsDir); } catch (e) { return result; }

        entries.forEach(function (entry) {
            const fullPath = path.join(presetsDir, entry);
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    if (DEFAULT_PRESET_FOLDERS.has(entry.toLowerCase())) return;
                    result.folders.push(entry);
                    result.subfolderCount++;
                    const scan = scanDirectory(fullPath);
                    scan.files.forEach(function (f) {
                        result.files.push({
                            relativePath: path.join(entry, f.relativePath),
                            fullPath: f.fullPath, size: f.size
                        });
                    });
                } else if (stat.isFile()) {
                    result.files.push({ relativePath: entry, fullPath, size: stat.size });
                }
            } catch (e) { /* skip */ }
        });

        return result;
    }

    /**
     * Compute difference: items in source but missing in target.
     */
    function computeMissing(sourceItems, targetDir) {
        if (!targetDir || !fs.existsSync(targetDir)) {
            // Target doesn't exist at all — everything is missing
            return { missing: sourceItems.files.slice(), existing: [] };
        }

        const missing = [];
        const existing = [];

        sourceItems.files.forEach(function (file) {
            const targetPath = path.join(targetDir, file.relativePath);
            if (fs.existsSync(targetPath)) {
                existing.push(file);
            } else {
                missing.push(file);
            }
        });

        return { missing, existing };
    }

    /**
     * Full scan of source version.
     */
    function scanSource(version) {
        const paths = getVersionPaths(version);
        return {
            plugins: scanPlugins(paths.pluginsDir),
            scripts: scanScripts(paths.scriptsDir),
            presets: scanPresets(paths.presetsDir),
            userPresets: scanDirectory(paths.userPresetsDir),
            templates: scanDirectory(paths.templatesDir),
            get totalFiles() {
                return this.plugins.files.length + this.scripts.files.length +
                    this.presets.files.length + this.userPresets.files.length +
                    this.templates.files.length;
            }
        };
    }

    // ── Backup & Copy (Documents items only) ───────────────

    function createBackup(dirPath) {
        if (!dirPath || !fs.existsSync(dirPath)) {
            return { success: true, backupPath: null, skipped: true };
        }
        const now = new Date();
        const ts = now.getFullYear().toString() +
            pad2(now.getMonth() + 1) + pad2(now.getDate()) + '_' +
            pad2(now.getHours()) + pad2(now.getMinutes()) + pad2(now.getSeconds());
        const backupPath = dirPath + '_backup_' + ts;
        try {
            copyDirectoryRecursive(dirPath, backupPath);
            return { success: true, backupPath };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    function pad2(n) { return n < 10 ? '0' + n : '' + n; }

    function copyDirectoryRecursive(src, dest) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(function (entry) {
            const s = path.join(src, entry), d = path.join(dest, entry);
            if (fs.statSync(s).isDirectory()) copyDirectoryRecursive(s, d);
            else fs.copyFileSync(s, d);
        });
    }

    function copyFiles(files, targetBaseDir) {
        const result = { copied: 0, skipped: [], errors: [] };
        files.forEach(function (file) {
            const destPath = path.join(targetBaseDir, file.relativePath);
            const destDir = path.dirname(destPath);
            try {
                if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
                if (fs.existsSync(destPath)) { result.skipped.push(file.relativePath); return; }
                fs.copyFileSync(file.fullPath, destPath);
                result.copied++;
            } catch (e) {
                result.errors.push(file.relativePath + ' \u2014 ' + e.message);
            }
        });
        return result;
    }

    // ── Migration ──────────────────────────────────────────

    async function executeMigration() {
        if (isMigrating || !sourceVersion || !targetVersion || !scanResult) return;

        const doPlugins = getChk('plugins');
        const doScripts = getChk('scripts');
        const doPresets = getChk('presets');
        const doUserPresets = getChk('userPresets');
        const doTemplates = getChk('templates');

        if (!doPlugins && !doScripts && !doPresets && !doUserPresets && !doTemplates) {
            log('No categories selected.', 'warning');
            return;
        }

        const sourcePaths = getVersionPaths(sourceVersion);
        const targetPaths = getVersionPaths(targetVersion);

        // Count what will be done
        const programFilesCategories = [];
        const docsCopyCategories = [];
        if (doPlugins && scanResult.plugins.files.length > 0) programFilesCategories.push('Plug-ins');
        if (doScripts && scanResult.scripts.files.length > 0) programFilesCategories.push('ScriptUI Panels');
        if (doPresets && scanResult.presets.files.length > 0) programFilesCategories.push('Presets');
        if (doUserPresets && scanResult.userPresets.files.length > 0) docsCopyCategories.push('User Presets');
        if (doTemplates && scanResult.templates.files.length > 0) docsCopyCategories.push('Templates');

        if (programFilesCategories.length === 0 && docsCopyCategories.length === 0) {
            log('Nothing to migrate (0 files in selected categories).', 'info');
            return;
        }

        // Build confirmation message
        let msg = sourceVersion.label + ' \u2192 ' + targetVersion.label + '\n\n';
        if (programFilesCategories.length > 0) {
            msg += '\u{1F50D} REPORT: ' + programFilesCategories.join(', ') +
                '\n   Missing items will be listed. Both folders will be opened for manual copy.\n\n';
        }
        if (docsCopyCategories.length > 0) {
            msg += '\u{1F4E6} AUTO-COPY: ' + docsCopyCategories.join(', ') +
                '\n   Files will be copied automatically (backup first, no overwrites).\n';
        }
        msg += '\nProceed?';
        if (!confirm(msg)) return;

        isMigrating = true;
        updateMigrateButton();
        clearLog();

        log(sourceVersion.label + ' \u2192 ' + targetVersion.label, 'info');

        // ══════════════════════════════════════════════════
        // PART 1: Program Files — Report & Open Folders
        // ══════════════════════════════════════════════════
        if (programFilesCategories.length > 0) {
            log('', 'info');
            log('\u2550'.repeat(44), 'info');
            log('MISSING ITEMS REPORT (manual copy needed)', 'info');
            log('\u2550'.repeat(44), 'info');

            if (doPlugins && scanResult.plugins.files.length > 0) {
                const diff = computeMissing(scanResult.plugins, targetPaths.pluginsDir);
                log('', 'info');
                log('\u25A0 Plug-ins (3rd party)', 'info');
                if (diff.missing.length > 0) {
                    // Group by top-level folder
                    const folders = new Set();
                    diff.missing.forEach(function (f) {
                        folders.add(f.relativePath.split(/[\\/]/)[0]);
                    });
                    folders.forEach(function (folder) {
                        log('  \u2717 ' + folder + ' — missing in target', 'error');
                    });
                    log('  \u2192 ' + diff.missing.length + ' files in ' + folders.size + ' folder(s) need copying', 'warning');
                } else {
                    log('  \u2713 All plug-in folders already exist in target', 'success');
                }
                if (diff.existing.length > 0) {
                    log('  \u2713 ' + diff.existing.length + ' files already present', 'success');
                }
            }

            if (doScripts && scanResult.scripts.files.length > 0) {
                const diff = computeMissing(scanResult.scripts, targetPaths.scriptsDir);
                log('', 'info');
                log('\u25A0 ScriptUI Panels', 'info');
                if (diff.missing.length > 0) {
                    diff.missing.forEach(function (f) {
                        // Show top-level file/folder name only
                        const topName = f.relativePath.split(/[\\/]/)[0];
                        log('  \u2717 ' + topName, 'error');
                    });
                    // Deduplicate log for folder-based scripts
                    log('  \u2192 ' + diff.missing.length + ' file(s) need copying', 'warning');
                } else {
                    log('  \u2713 All scripts already exist in target', 'success');
                }
            }

            if (doPresets && scanResult.presets.files.length > 0) {
                const diff = computeMissing(scanResult.presets, targetPaths.presetsDir);
                log('', 'info');
                log('\u25A0 Presets (non-default)', 'info');
                if (diff.missing.length > 0) {
                    const folders = new Set();
                    diff.missing.forEach(function (f) {
                        const top = f.relativePath.split(/[\\/]/)[0];
                        if (top.indexOf('.') === -1) folders.add(top);
                        else log('  \u2717 ' + top, 'error');
                    });
                    folders.forEach(function (folder) {
                        log('  \u2717 ' + folder + '/', 'error');
                    });
                    log('  \u2192 ' + diff.missing.length + ' file(s) need copying', 'warning');
                } else {
                    log('  \u2713 All presets already exist in target', 'success');
                }
            }

            log('', 'info');
            log('\u2500'.repeat(44), 'info');
            log('\u26A0 Plug-ins (.aex) may not be compatible across AE versions.', 'warning');
            log('  Check vendor sites for version compatibility before copying.', 'warning');
            log('\u2500'.repeat(44), 'info');
        }

        // ══════════════════════════════════════════════════
        // PART 2: Documents — Auto-copy with backup
        // ══════════════════════════════════════════════════
        if (docsCopyCategories.length > 0) {
            log('', 'info');
            log('\u2550'.repeat(44), 'info');
            log('AUTO-COPY (Documents)', 'info');
            log('\u2550'.repeat(44), 'info');

            let totalCopied = 0, totalSkipped = 0, totalErrors = 0;

            // Backup
            if (doUserPresets && scanResult.userPresets.files.length > 0) {
                const backup = createBackup(targetPaths.userPresetsDir);
                if (!backup.success) {
                    log('\u2717 Backup failed: ' + backup.error, 'error');
                    isMigrating = false; updateMigrateButton(); return;
                }
                if (backup.backupPath) log('\u2713 Backup: User Presets \u2192 ' + shortenPath(backup.backupPath), 'success');
            }
            if (doTemplates && scanResult.templates.files.length > 0) {
                const backup = createBackup(targetPaths.templatesDir);
                if (!backup.success) {
                    log('\u2717 Backup failed: ' + backup.error, 'error');
                    isMigrating = false; updateMigrateButton(); return;
                }
                if (backup.backupPath) log('\u2713 Backup: Templates \u2192 ' + shortenPath(backup.backupPath), 'success');
            }

            await new Promise(function (r) { setTimeout(r, 50); });

            // Copy
            if (doUserPresets && scanResult.userPresets.files.length > 0) {
                const r = copyFiles(scanResult.userPresets.files, targetPaths.userPresetsDir);
                totalCopied += r.copied; totalSkipped += r.skipped.length; totalErrors += r.errors.length;
                log('\u2713 User Presets: ' + r.copied + '/' + scanResult.userPresets.files.length + ' copied',
                    r.errors.length > 0 ? 'warning' : 'success');
                r.skipped.forEach(function (f) { log('  \u26A0 Skipped: ' + path.basename(f) + ' (exists)', 'warning'); });
                r.errors.forEach(function (e) { log('  \u2717 ' + e, 'error'); });
            }

            if (doTemplates && scanResult.templates.files.length > 0) {
                const r = copyFiles(scanResult.templates.files, targetPaths.templatesDir);
                totalCopied += r.copied; totalSkipped += r.skipped.length; totalErrors += r.errors.length;
                log('\u2713 Templates: ' + r.copied + '/' + scanResult.templates.files.length + ' copied',
                    r.errors.length > 0 ? 'warning' : 'success');
                r.skipped.forEach(function (f) { log('  \u26A0 Skipped: ' + path.basename(f) + ' (exists)', 'warning'); });
                r.errors.forEach(function (e) { log('  \u2717 ' + e, 'error'); });
            }

            log('', 'info');
            log('Auto-copy done: ' + totalCopied + ' copied, ' + totalSkipped + ' skipped, ' + totalErrors + ' errors.',
                totalErrors > 0 ? 'warning' : 'success');
        }

        log('', 'info');
        log('\u2550'.repeat(44), 'info');
        log('Done!', 'success');

        isMigrating = false;
        updateMigrateButton();
    }

    function getChk(id) {
        const el = document.getElementById('chk-' + id);
        return el && el.checked && scanResult[id].files.length > 0;
    }

    // ── Open Folders ───────────────────────────────────────

    function openBothFolders(category) {
        if (!sourceVersion || !targetVersion) return;
        const sp = getVersionPaths(sourceVersion);
        const tp = getVersionPaths(targetVersion);

        const dirMap = {
            plugins: ['pluginsDir', 'pluginsDir'],
            scripts: ['scriptsDir', 'scriptsDir'],
            presets: ['presetsDir', 'presetsDir']
        };

        const keys = dirMap[category];
        if (!keys) return;

        const sourceDir = sp[keys[0]];
        const targetDir = tp[keys[1]];

        if (sourceDir) openFolder(sourceDir);
        // Small delay so two Explorer windows don't overlap
        setTimeout(function () {
            if (targetDir) {
                // Create target dir if it doesn't exist (e.g., ScriptUI Panels)
                if (!fs.existsSync(targetDir)) {
                    try { fs.mkdirSync(targetDir, { recursive: true }); } catch (e) { /* */ }
                }
                openFolder(targetDir);
            }
        }, 300);
    }

    // Expose to HTML onclick
    window.openBothFolders = openBothFolders;

    // ── UI Helpers ─────────────────────────────────────────

    function shortenPath(p) {
        const parts = p.replace(/\\/g, '/').split('/');
        return parts.length > 4 ? '.../' + parts.slice(-4).join('/') : p;
    }

    function populateDropdowns() {
        detectedVersions = detectVersions();
        const sourceSelect = document.getElementById('source-select');
        const targetSelect = document.getElementById('target-select');

        sourceSelect.innerHTML = '<option value="">-- Select Source --</option>';
        targetSelect.innerHTML = '<option value="">-- Select Target --</option>';

        if (detectedVersions.length === 0) {
            sourceSelect.innerHTML = '<option value="">No AE versions found</option>';
            targetSelect.innerHTML = '<option value="">No AE versions found</option>';
            return;
        }

        detectedVersions.forEach(function (v, i) {
            sourceSelect.appendChild(makeOpt(i, v.label));
            targetSelect.appendChild(makeOpt(i, v.label));
        });

        if (detectedVersions.length >= 2) {
            sourceSelect.value = detectedVersions.length - 2;
            targetSelect.value = detectedVersions.length - 1;
            onSourceChange();
            onTargetChange();
        }
    }

    function makeOpt(value, text) {
        const o = document.createElement('option');
        o.value = value; o.textContent = text;
        return o;
    }

    function onSourceChange() {
        const idx = document.getElementById('source-select').value;
        sourceVersion = idx !== '' ? detectedVersions[parseInt(idx)] : null;
        updateScanResults();
    }

    function onTargetChange() {
        const idx = document.getElementById('target-select').value;
        targetVersion = idx !== '' ? detectedVersions[parseInt(idx)] : null;
        validateSelection();
    }

    function validateSelection() {
        const btn = document.getElementById('btn-migrate');
        const warning = document.getElementById('selection-warning');

        if (sourceVersion && targetVersion && sourceVersion.year === targetVersion.year) {
            warning.textContent = 'Source and Target must be different versions.';
            warning.style.display = 'block';
            btn.disabled = true;
        } else {
            warning.style.display = 'none';
            btn.disabled = !(sourceVersion && targetVersion && scanResult && scanResult.totalFiles > 0);
        }

        // Show/hide open-folders buttons based on target selection
        document.querySelectorAll('.btn-open-folders').forEach(function (btn) {
            btn.style.display = (sourceVersion && targetVersion &&
                sourceVersion.year !== targetVersion.year) ? 'inline-block' : 'none';
        });
    }

    function updateScanResults() {
        const container = document.getElementById('scan-results');

        if (!sourceVersion) {
            container.style.display = 'none';
            scanResult = null;
            validateSelection();
            return;
        }

        scanResult = scanSource(sourceVersion);
        container.style.display = 'block';

        // Program Files categories
        updateCategoryRow('plugins', scanResult.plugins);
        updateCategoryRow('scripts', scanResult.scripts);
        updateCategoryRow('presets', scanResult.presets);

        // Documents categories
        updateCategoryRow('userPresets', scanResult.userPresets);
        updateCategoryRow('templates', scanResult.templates);

        document.getElementById('total-files').textContent = 'Total: ' + scanResult.totalFiles + ' files';
        validateSelection();
    }

    function updateCategoryRow(id, data) {
        const row = document.getElementById('row-' + id);
        const chk = document.getElementById('chk-' + id);
        const countEl = document.getElementById('count-' + id);
        const detailEl = document.getElementById('detail-' + id);

        const count = data.files.length;
        chk.checked = count > 0;
        chk.disabled = count === 0;
        countEl.textContent = count + ' files';
        row.style.opacity = count > 0 ? '1' : '0.4';

        if (detailEl) {
            if (data.folders && data.folders.length > 0) {
                detailEl.textContent = data.folders.join(', ');
            } else if (data.subfolderCount > 0) {
                detailEl.textContent = '(' + data.subfolderCount + ' subfolders)';
            } else {
                detailEl.textContent = '';
            }
        }
    }

    function updateMigrateButton() {
        const btn = document.getElementById('btn-migrate');
        if (isMigrating) {
            btn.disabled = true;
            btn.textContent = 'Working...';
        } else {
            btn.textContent = '\u25B6 Migrate';
            validateSelection();
        }
    }

    // ── Logging ────────────────────────────────────────────

    function log(message, type) {
        const logEl = document.getElementById('log-content');
        const ph = logEl.querySelector('.log-placeholder');
        if (ph) ph.remove();
        const line = document.createElement('div');
        line.className = 'log-line log-' + (type || 'info');
        line.textContent = message;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function clearLog() {
        document.getElementById('log-content').innerHTML = '';
    }

    // ── Init ───────────────────────────────────────────────

    function init() {
        populateDropdowns();

        // Debug: show detected paths and versions in log
        const pfDirs = getProgramFilesDirs();
        log('Scan paths: ' + (pfDirs.length > 0 ? pfDirs.join(', ') : '(none found)'), 'info');
        log('Documents: ' + getDocumentsDir(), 'info');
        log('Detected ' + detectedVersions.length + ' version(s):', 'info');
        detectedVersions.forEach(function (v) {
            const parts = [];
            if (v.supportFilesDir) parts.push('PF');
            if (v.docsDir) parts.push('Docs');
            log('  ' + v.label + ' [' + parts.join('+') + ']', 'info');
        });

        document.getElementById('source-select').addEventListener('change', function () { onSourceChange(); onTargetChange(); });
        document.getElementById('target-select').addEventListener('change', function () { onTargetChange(); });
        document.getElementById('btn-migrate').addEventListener('click', function () { executeMigration(); });
        document.getElementById('btn-refresh').addEventListener('click', function () { populateDropdowns(); clearLog(); log('Refreshed.', 'info'); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
