/**
 * AE Mover — Main Application Logic
 * Migrates user presets, Output Module templates, and Render Settings
 * between After Effects versions.
 *
 * Runs in CEP Node.js environment.
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const csInterface = new CSInterface();

    // ── State ──────────────────────────────────────────────
    let detectedVersions = [];
    let sourceVersion = null;
    let targetVersion = null;
    let scanResult = null;
    let isMigrating = false;

    // ── Path Helpers ───────────────────────────────────────

    function getDocumentsDir() {
        if (os.platform() === 'win32') {
            // Windows: typically C:\Users\<name>\Documents
            return path.join(os.homedir(), 'Documents');
        } else {
            // macOS
            return path.join(os.homedir(), 'Documents');
        }
    }

    function getAEBaseDir() {
        return path.join(getDocumentsDir(), 'Adobe');
    }

    /**
     * Build paths for a given AE version year.
     * Returns { presetsDir, templatesDir, label }
     */
    function getVersionPaths(versionYear) {
        const baseDir = getAEBaseDir();
        // AE folder names: "After Effects CC 20XX" or "After Effects 20XX"
        // We store the actual detected folder name
        const folderName = versionYear.folderName;
        const aeDir = path.join(baseDir, folderName);
        return {
            presetsDir: path.join(aeDir, 'User Presets'),
            templatesDir: path.join(aeDir, 'Templates'),
            baseDir: aeDir
        };
    }

    // ── Version Detection ──────────────────────────────────

    function detectVersions() {
        const baseDir = getAEBaseDir();
        const versions = [];

        if (!fs.existsSync(baseDir)) {
            return versions;
        }

        let entries;
        try {
            entries = fs.readdirSync(baseDir);
        } catch (e) {
            log('Error reading Adobe directory: ' + e.message, 'error');
            return versions;
        }

        // Match "After Effects CC 20XX" or "After Effects 20XX"
        const aePattern = /^After Effects(?:\s+CC)?\s+(20\d{2})$/i;

        entries.forEach(function (entry) {
            const match = entry.match(aePattern);
            if (!match) return;

            const fullPath = path.join(baseDir, entry);
            try {
                const stat = fs.statSync(fullPath);
                if (!stat.isDirectory()) return;
            } catch (e) {
                return;
            }

            const year = match[1];
            const majorVersion = parseInt(year, 10) - 2000 + 2; // 2022→22, 2024→24, etc.

            versions.push({
                year: year,
                folderName: entry,
                majorVersion: majorVersion,
                label: entry + ' (v' + majorVersion + '.x)'
            });
        });

        // Sort by year ascending
        versions.sort(function (a, b) { return parseInt(a.year) - parseInt(b.year); });
        return versions;
    }

    // ── File Scanning ──────────────────────────────────────

    /**
     * Recursively scan a directory and return file info.
     * Returns { files: [{relativePath, fullPath, size}], subfolderCount }
     */
    function scanDirectory(dirPath) {
        const result = { files: [], subfolderCount: 0 };

        if (!fs.existsSync(dirPath)) {
            return result;
        }

        function walk(currentDir, relativeBase) {
            let entries;
            try {
                entries = fs.readdirSync(currentDir);
            } catch (e) {
                return;
            }

            entries.forEach(function (entry) {
                const fullPath = path.join(currentDir, entry);
                const relativePath = relativeBase ? path.join(relativeBase, entry) : entry;

                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        if (relativeBase === '') {
                            result.subfolderCount++;
                        }
                        walk(fullPath, relativePath);
                    } else if (stat.isFile()) {
                        result.files.push({
                            relativePath: relativePath,
                            fullPath: fullPath,
                            size: stat.size
                        });
                    }
                } catch (e) {
                    // Skip inaccessible files
                }
            });
        }

        walk(dirPath, '');
        return result;
    }

    /**
     * Scan source version and return categorized results.
     */
    function scanSource(version) {
        const paths = getVersionPaths(version);
        const result = {
            presets: { files: [], subfolderCount: 0, dirExists: false },
            outputModules: { files: [], subfolderCount: 0, dirExists: false },
            renderSettings: { files: [], subfolderCount: 0, dirExists: false },
            totalFiles: 0
        };

        // Scan User Presets (*.ffx files in subdirectories)
        if (fs.existsSync(paths.presetsDir)) {
            result.presets.dirExists = true;
            const scan = scanDirectory(paths.presetsDir);
            result.presets.files = scan.files;
            result.presets.subfolderCount = scan.subfolderCount;
        }

        // Scan Templates directory
        if (fs.existsSync(paths.templatesDir)) {
            // Output Module templates and Render Settings are both in Templates/
            const scan = scanDirectory(paths.templatesDir);
            scan.files.forEach(function (file) {
                // Categorize by common naming patterns
                const lower = file.relativePath.toLowerCase();
                if (lower.indexOf('output') !== -1 || lower.indexOf('om ') !== -1 || lower.endsWith('.aom')) {
                    result.outputModules.files.push(file);
                    result.outputModules.dirExists = true;
                } else if (lower.indexOf('render') !== -1 || lower.indexOf('rs ') !== -1 || lower.endsWith('.ars')) {
                    result.renderSettings.files.push(file);
                    result.renderSettings.dirExists = true;
                } else {
                    // Default: treat as output module template
                    result.outputModules.files.push(file);
                    result.outputModules.dirExists = true;
                }
            });
            if (!result.outputModules.dirExists && !result.renderSettings.dirExists && scan.files.length > 0) {
                // If no categorization matched, put all in output modules
                result.outputModules.files = scan.files;
                result.outputModules.dirExists = true;
            }
        }

        result.totalFiles = result.presets.files.length +
            result.outputModules.files.length +
            result.renderSettings.files.length;

        return result;
    }

    // ── Backup ─────────────────────────────────────────────

    /**
     * Create a backup of the target directory.
     * Returns { success, backupPath, error }
     */
    function createBackup(dirPath, label) {
        if (!fs.existsSync(dirPath)) {
            return { success: true, backupPath: null, skipped: true };
        }

        const now = new Date();
        const timestamp = now.getFullYear().toString() +
            pad2(now.getMonth() + 1) + pad2(now.getDate()) + '_' +
            pad2(now.getHours()) + pad2(now.getMinutes()) + pad2(now.getSeconds());
        const backupPath = dirPath + '_backup_' + timestamp;

        try {
            copyDirectoryRecursive(dirPath, backupPath);
            return { success: true, backupPath: backupPath };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    /**
     * Recursively copy a directory.
     */
    function copyDirectoryRecursive(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src);
        entries.forEach(function (entry) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            const stat = fs.statSync(srcPath);

            if (stat.isDirectory()) {
                copyDirectoryRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    // ── Migration ──────────────────────────────────────────

    /**
     * Copy files from source to target, preserving subfolder structure.
     * Skips files that already exist in target (no overwrite).
     *
     * @param {Array} files - Array of {relativePath, fullPath}
     * @param {string} targetBaseDir - Target directory root
     * @returns {{ copied: number, skipped: string[], errors: string[] }}
     */
    function copyFiles(files, targetBaseDir) {
        const result = { copied: 0, skipped: [], errors: [] };

        files.forEach(function (file) {
            const destPath = path.join(targetBaseDir, file.relativePath);
            const destDir = path.dirname(destPath);

            try {
                // Create subdirectory if needed
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }

                // SAFETY: Never overwrite existing files
                if (fs.existsSync(destPath)) {
                    result.skipped.push(file.relativePath);
                    return;
                }

                // Copy file (read from source only, never write to source)
                fs.copyFileSync(file.fullPath, destPath);
                result.copied++;
            } catch (e) {
                result.errors.push(file.relativePath + ' \u2014 ' + e.message);
            }
        });

        return result;
    }

    /**
     * Execute full migration.
     */
    async function executeMigration() {
        if (isMigrating) return;
        if (!sourceVersion || !targetVersion) return;
        if (!scanResult) return;

        const migratePresets = document.getElementById('chk-presets').checked;
        const migrateOM = document.getElementById('chk-outputmodules').checked;
        const migrateRS = document.getElementById('chk-rendersettings').checked;

        if (!migratePresets && !migrateOM && !migrateRS) {
            log('No categories selected.', 'warning');
            return;
        }

        // Confirmation dialog
        const totalSelected =
            (migratePresets ? scanResult.presets.files.length : 0) +
            (migrateOM ? scanResult.outputModules.files.length : 0) +
            (migrateRS ? scanResult.renderSettings.files.length : 0);

        if (!confirm('Migrate ' + totalSelected + ' files from ' + sourceVersion.label + ' to ' + targetVersion.label + '?\n\nA backup of the target folders will be created before migration.')) {
            return;
        }

        isMigrating = true;
        updateMigrateButton();
        clearLog();

        const targetPaths = getVersionPaths(targetVersion);
        let totalCopied = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        // ── Step 1: Backup target folders ──
        log('Starting migration...', 'info');
        log('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', 'info');

        if (migratePresets && scanResult.presets.files.length > 0) {
            const backup = createBackup(targetPaths.presetsDir, 'User Presets');
            if (!backup.success) {
                log('\u2717 Backup failed for User Presets: ' + backup.error, 'error');
                isMigrating = false;
                updateMigrateButton();
                return;
            }
            if (backup.backupPath) {
                log('\u2713 Backup created: ' + shortenPath(backup.backupPath), 'success');
            } else if (backup.skipped) {
                log('\u2713 Target User Presets folder does not exist yet (no backup needed)', 'info');
            }
        }

        if ((migrateOM || migrateRS) &&
            (scanResult.outputModules.files.length > 0 || scanResult.renderSettings.files.length > 0)) {
            const backup = createBackup(targetPaths.templatesDir, 'Templates');
            if (!backup.success) {
                log('\u2717 Backup failed for Templates: ' + backup.error, 'error');
                isMigrating = false;
                updateMigrateButton();
                return;
            }
            if (backup.backupPath) {
                log('\u2713 Backup created: ' + shortenPath(backup.backupPath), 'success');
            } else if (backup.skipped) {
                log('\u2713 Target Templates folder does not exist yet (no backup needed)', 'info');
            }
        }

        log('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', 'info');

        // ── Step 2: Copy files ──
        // Use setTimeout to avoid blocking UI
        await new Promise(function (resolve) { setTimeout(resolve, 50); });

        if (migratePresets && scanResult.presets.files.length > 0) {
            const result = copyFiles(scanResult.presets.files, targetPaths.presetsDir);
            totalCopied += result.copied;
            totalSkipped += result.skipped.length;
            totalErrors += result.errors.length;

            log('\u2713 Animation Presets: ' + result.copied + '/' + scanResult.presets.files.length + ' copied', 'success');
            result.skipped.forEach(function (f) {
                log('  \u26A0 Skipped: ' + path.basename(f) + ' (already exists)', 'warning');
            });
            result.errors.forEach(function (e) {
                log('  \u2717 Error: ' + e, 'error');
            });
        }

        if (migrateOM && scanResult.outputModules.files.length > 0) {
            const result = copyFiles(scanResult.outputModules.files, targetPaths.templatesDir);
            totalCopied += result.copied;
            totalSkipped += result.skipped.length;
            totalErrors += result.errors.length;

            log('\u2713 Output Module Templates: ' + result.copied + '/' + scanResult.outputModules.files.length + ' copied', 'success');
            result.skipped.forEach(function (f) {
                log('  \u26A0 Skipped: ' + path.basename(f) + ' (already exists)', 'warning');
            });
            result.errors.forEach(function (e) {
                log('  \u2717 Error: ' + e, 'error');
            });
        }

        if (migrateRS && scanResult.renderSettings.files.length > 0) {
            const result = copyFiles(scanResult.renderSettings.files, targetPaths.templatesDir);
            totalCopied += result.copied;
            totalSkipped += result.skipped.length;
            totalErrors += result.errors.length;

            log('\u2713 Render Settings: ' + result.copied + '/' + scanResult.renderSettings.files.length + ' copied', 'success');
            result.skipped.forEach(function (f) {
                log('  \u26A0 Skipped: ' + path.basename(f) + ' (already exists)', 'warning');
            });
            result.errors.forEach(function (e) {
                log('  \u2717 Error: ' + e, 'error');
            });
        }

        log('\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', 'info');
        log('Migration complete! ' + totalCopied + ' files copied, ' +
            totalSkipped + ' skipped, ' + totalErrors + ' errors.', totalErrors > 0 ? 'warning' : 'success');

        isMigrating = false;
        updateMigrateButton();
    }

    // ── UI Helpers ─────────────────────────────────────────

    function shortenPath(p) {
        // Show last 3 segments
        const parts = p.replace(/\\/g, '/').split('/');
        if (parts.length > 3) {
            return '.../' + parts.slice(-3).join('/');
        }
        return p;
    }

    function populateDropdowns() {
        detectedVersions = detectVersions();

        const sourceSelect = document.getElementById('source-select');
        const targetSelect = document.getElementById('target-select');

        // Clear existing options
        sourceSelect.innerHTML = '<option value="">-- Select Source --</option>';
        targetSelect.innerHTML = '<option value="">-- Select Target --</option>';

        if (detectedVersions.length === 0) {
            sourceSelect.innerHTML = '<option value="">No AE versions found</option>';
            targetSelect.innerHTML = '<option value="">No AE versions found</option>';
            return;
        }

        detectedVersions.forEach(function (v, i) {
            const opt1 = document.createElement('option');
            opt1.value = i;
            opt1.textContent = v.label;
            sourceSelect.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = i;
            opt2.textContent = v.label;
            targetSelect.appendChild(opt2);
        });

        // Auto-select: source = second-to-last, target = last
        if (detectedVersions.length >= 2) {
            sourceSelect.value = detectedVersions.length - 2;
            targetSelect.value = detectedVersions.length - 1;
            onSourceChange();
            onTargetChange();
        }
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
    }

    function updateScanResults() {
        const container = document.getElementById('scan-results');
        const presetsRow = document.getElementById('row-presets');
        const omRow = document.getElementById('row-outputmodules');
        const rsRow = document.getElementById('row-rendersettings');
        const totalEl = document.getElementById('total-files');

        if (!sourceVersion) {
            container.style.display = 'none';
            scanResult = null;
            validateSelection();
            return;
        }

        scanResult = scanSource(sourceVersion);
        container.style.display = 'block';

        // Animation Presets
        const presetCount = scanResult.presets.files.length;
        document.getElementById('chk-presets').checked = presetCount > 0;
        document.getElementById('chk-presets').disabled = presetCount === 0;
        document.getElementById('presets-count').textContent = presetCount + ' files';
        document.getElementById('presets-subfolders').textContent =
            scanResult.presets.subfolderCount > 0
                ? '(' + scanResult.presets.subfolderCount + ' subfolders)'
                : '';
        presetsRow.style.opacity = presetCount > 0 ? '1' : '0.4';

        // Output Module Templates
        const omCount = scanResult.outputModules.files.length;
        document.getElementById('chk-outputmodules').checked = omCount > 0;
        document.getElementById('chk-outputmodules').disabled = omCount === 0;
        document.getElementById('om-count').textContent = omCount + ' files';
        omRow.style.opacity = omCount > 0 ? '1' : '0.4';

        // Render Settings
        const rsCount = scanResult.renderSettings.files.length;
        document.getElementById('chk-rendersettings').checked = rsCount > 0;
        document.getElementById('chk-rendersettings').disabled = rsCount === 0;
        document.getElementById('rs-count').textContent = rsCount + ' files';
        rsRow.style.opacity = rsCount > 0 ? '1' : '0.4';

        // Total
        totalEl.textContent = 'Total: ' + scanResult.totalFiles + ' files';

        validateSelection();
    }

    function updateMigrateButton() {
        const btn = document.getElementById('btn-migrate');
        if (isMigrating) {
            btn.disabled = true;
            btn.textContent = 'Migrating...';
        } else {
            btn.textContent = '\u25B6 Migrate';
            validateSelection();
        }
    }

    // ── Logging ────────────────────────────────────────────

    function log(message, type) {
        const logEl = document.getElementById('log-content');
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

        document.getElementById('source-select').addEventListener('change', function () {
            onSourceChange();
            onTargetChange();
        });
        document.getElementById('target-select').addEventListener('change', function () {
            onTargetChange();
        });

        document.getElementById('btn-migrate').addEventListener('click', function () {
            executeMigration();
        });

        document.getElementById('btn-refresh').addEventListener('click', function () {
            populateDropdowns();
            clearLog();
            log('Refreshed version list.', 'info');
        });
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
