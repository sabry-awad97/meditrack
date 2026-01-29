# Tauri Auto-Updater Implementation Guide

A complete guide to implementing automatic updates in Tauri applications using GitHub Releases. No custom server required!

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Implementation Steps](#implementation-steps)
  - [1. Backend Setup (Rust)](#1-backend-setup-rust)
  - [2. Frontend Setup (React/TypeScript)](#2-frontend-setup-reacttypescript)
  - [3. Configuration](#3-configuration)
  - [4. GitHub Actions Setup](#4-github-actions-setup)
  - [5. Signing Keys](#5-signing-keys)
  - [6. First Release](#6-first-release)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

This guide implements:

- ✅ Automatic update checking on app launch
- ✅ Manual update check in settings
- ✅ Download progress tracking
- ✅ Cryptographic signature verification
- ✅ GitHub Releases integration (no server needed)
- ✅ Multi-platform support (Windows, macOS, Linux)

**Time to implement**: ~30 minutes  
**Cost**: Free (using GitHub Releases)

---

## Prerequisites

- Tauri v2.x project
- GitHub repository (public recommended)
- Node.js/Bun and Rust installed
- Basic knowledge of React and Rust

---

## Implementation Steps

### 1. Backend Setup (Rust)

#### 1.1 Add Dependency

Edit `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri-plugin-updater = "2"
```

#### 1.2 Integrate Plugin

Edit `src-tauri/src/lib.rs`:

```rust
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      // Auto-check for updates on startup (production only)
      #[cfg(not(debug_assertions))]
      {
        let handle = app.handle().clone();
        tauri::async_runtime::spawn(async move {
          match handle.updater().check().await {
            Ok(Some(update)) => {
              log::info!("Update available: {}", update.version);
            }
            Ok(None) => {
              log::info!("No updates available");
            }
            Err(e) => {
              log::error!("Failed to check for updates: {}", e);
            }
          }
        });
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

#### 1.3 Configure Permissions

Edit `src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "enables the default permissions",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "updater:default",
    "updater:allow-check",
    "updater:allow-download",
    "updater:allow-download-and-install",
    "updater:allow-install"
  ]
}
```

---

### 2. Frontend Setup (React/TypeScript)

#### 2.1 Install Dependencies

```bash
npm install @tauri-apps/plugin-updater @tauri-apps/plugin-process
# or
bun add @tauri-apps/plugin-updater @tauri-apps/plugin-process
```

#### 2.2 Create Update Hook

Create `src/hooks/use-app-updater.ts`:

```typescript
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useState, useEffect } from "react";

export function useAppUpdater() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = async () => {
    setChecking(true);
    setError(null);

    try {
      const updateInfo = await check();
      setUpdate(updateInfo ?? null);
      return updateInfo;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to check for updates";
      setError(message);
      console.error("Update check failed:", err);
      return null;
    } finally {
      setChecking(false);
    }
  };

  const downloadAndInstall = async () => {
    if (!update) return;

    setDownloading(true);
    setError(null);

    try {
      let totalBytes = 0;
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            setDownloadProgress(0);
            totalBytes = 0;
            console.log("Download started");
            break;
          case "Progress":
            totalBytes += event.data.chunkLength;
            setDownloadProgress(
              Math.min((totalBytes / (1024 * 1024 * 50)) * 100, 99),
            );
            console.log(`Downloaded ${totalBytes} bytes`);
            break;
          case "Finished":
            setDownloadProgress(100);
            console.log("Download finished");
            break;
        }
      });

      await relaunch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to download update";
      setError(message);
      console.error("Update installation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Auto-check on mount (production only)
  useEffect(() => {
    if (import.meta.env.PROD) {
      checkForUpdates();
    }
  }, []);

  return {
    update,
    checking,
    downloading,
    downloadProgress,
    error,
    checkForUpdates,
    downloadAndInstall,
  };
}
```

#### 2.3 Create Update Dialog Component

Create `src/components/update-dialog.tsx`:

```typescript
import { useAppUpdater } from '@/hooks/use-app-updater';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle } from 'lucide-react';

export function UpdateDialog() {
  const {
    update,
    checking,
    downloading,
    downloadProgress,
    error,
    downloadAndInstall,
  } = useAppUpdater();

  const isOpen = !!update && !downloading;

  if (!update) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Update Available
          </DialogTitle>
          <DialogDescription>
            Version {update.version} is available for download
          </DialogDescription>
        </DialogHeader>

        {update.body && (
          <div className="my-4 max-h-60 overflow-y-auto rounded-md bg-muted p-4">
            <p className="text-sm whitespace-pre-wrap">{update.body}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {downloading && (
          <div className="space-y-2">
            <Progress value={downloadProgress} />
            <p className="text-sm text-muted-foreground text-center">
              Downloading... {Math.round(downloadProgress)}%
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={downloading || checking}
          >
            Later
          </Button>
          <Button
            onClick={downloadAndInstall}
            disabled={downloading || checking}
          >
            {downloading ? 'Downloading...' : 'Update Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### 2.4 Add to App Root

In your main app file (e.g., `src/main.tsx` or `src/App.tsx`):

```typescript
import { UpdateDialog } from './components/update-dialog';

// Add inside your app component
<UpdateDialog />
```

#### 2.5 Optional: Manual Update Check Component

Create `src/components/manual-update-check.tsx`:

```typescript
import { useAppUpdater } from '@/hooks/use-app-updater';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ManualUpdateCheck() {
  const { update, checking, error, checkForUpdates } = useAppUpdater();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Updates
        </CardTitle>
        <CardDescription>
          Check for new application updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!update && !error && !checking && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Application is up to date
            </AlertDescription>
          </Alert>
        )}

        {update && (
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              Update available: Version {update.version}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={checkForUpdates}
            disabled={checking}
            variant="outline"
          >
            {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {checking ? 'Checking...' : 'Check for Updates'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Current version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 3. Configuration

#### 3.1 Update tauri.conf.json

Edit `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "createUpdaterArtifacts": true
  },
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY_HERE",
      "endpoints": [
        "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json"
      ],
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

**Replace:**

- `YOUR_PUBLIC_KEY_HERE` - Your public key (generated in step 5)
- `YOUR_USERNAME` - Your GitHub username
- `YOUR_REPO` - Your repository name

**Install Modes (Windows):**

- `passive` - Shows progress (default, recommended)
- `basicUi` - Minimal UI
- `quiet` - Silent installation

---

### 4. GitHub Actions Setup

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest, ubuntu-22.04, windows-latest]

    runs-on: ${{ matrix.platform }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies (Ubuntu only)
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Install frontend dependencies
        run: npm install
        # or: bun install

      - name: Build the app
        env:
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
        run: npm run tauri build
        # or: bun run tauri build

      - name: Upload Release Assets
        uses: softprops/action-gh-release@v1
        with:
          files: |
            src-tauri/target/release/bundle/nsis/*.nsis.zip
            src-tauri/target/release/bundle/nsis/*.nsis.zip.sig
            src-tauri/target/release/bundle/macos/*.app.tar.gz
            src-tauri/target/release/bundle/macos/*.app.tar.gz.sig
            src-tauri/target/release/bundle/appimage/*.AppImage.tar.gz
            src-tauri/target/release/bundle/appimage/*.AppImage.tar.gz.sig
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  create-update-json:
    needs: release
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Get version
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Download release assets
        uses: robinraju/release-downloader@v1.8
        with:
          tag: ${{ github.ref_name }}
          fileName: "*.sig"
          out-file-path: "signatures"

      - name: Create latest.json
        run: |
          WIN_SIG=$(cat signatures/*x64-setup.nsis.zip.sig 2>/dev/null || echo "")
          LINUX_SIG=$(cat signatures/*amd64.AppImage.tar.gz.sig 2>/dev/null || echo "")
          MAC_X64_SIG=$(cat signatures/*x64.app.tar.gz.sig 2>/dev/null || echo "")
          MAC_ARM_SIG=$(cat signatures/*aarch64.app.tar.gz.sig 2>/dev/null || echo "")

          cat > latest.json << EOF
          {
            "version": "${{ steps.version.outputs.VERSION }}",
            "notes": "Release ${{ steps.version.outputs.VERSION }}",
            "pub_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "platforms": {
              "windows-x86_64": {
                "signature": "${WIN_SIG}",
                "url": "https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/YOUR_APP_NAME_${{ steps.version.outputs.VERSION }}_x64-setup.nsis.zip"
              },
              "linux-x86_64": {
                "signature": "${LINUX_SIG}",
                "url": "https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/YOUR_APP_NAME_${{ steps.version.outputs.VERSION }}_amd64.AppImage.tar.gz"
              },
              "darwin-x86_64": {
                "signature": "${MAC_X64_SIG}",
                "url": "https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/YOUR_APP_NAME_${{ steps.version.outputs.VERSION }}_x64.app.tar.gz"
              },
              "darwin-aarch64": {
                "signature": "${MAC_ARM_SIG}",
                "url": "https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/YOUR_APP_NAME_${{ steps.version.outputs.VERSION }}_aarch64.app.tar.gz"
              }
            }
          }
          EOF

      - name: Upload latest.json to release
        uses: softprops/action-gh-release@v1
        with:
          files: latest.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Replace `YOUR_APP_NAME` with your actual app name from `tauri.conf.json`**

---

### 5. Signing Keys

#### 5.1 Generate Keys

```bash
npx tauri signer generate -w ~/.tauri/YOUR_APP_NAME.key
# or
bunx tauri signer generate -w ~/.tauri/YOUR_APP_NAME.key
```

**Output:**

- Private key: `~/.tauri/YOUR_APP_NAME.key`
- Public key: `~/.tauri/YOUR_APP_NAME.key.pub`

**⚠️ CRITICAL: Backup your private key securely! If lost, you cannot publish updates!**

#### 5.2 Set Local Environment Variable

**Windows (PowerShell):**

```powershell
$privateKey = Get-Content "$env:USERPROFILE\.tauri\YOUR_APP_NAME.key" -Raw
[System.Environment]::SetEnvironmentVariable('TAURI_SIGNING_PRIVATE_KEY', $privateKey.Trim(), 'User')
```

**macOS/Linux (Bash/Zsh):**

```bash
export TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/YOUR_APP_NAME.key)
# Add to ~/.bashrc or ~/.zshrc for persistence
```

**Restart your terminal after setting!**

#### 5.3 Add GitHub Secret

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `TAURI_SIGNING_PRIVATE_KEY`
4. Value: Content of `~/.tauri/YOUR_APP_NAME.key`
5. Click "Add secret"

#### 5.4 Update Configuration

Copy the public key:

```bash
cat ~/.tauri/YOUR_APP_NAME.key.pub
```

Paste it into `src-tauri/tauri.conf.json` replacing `YOUR_PUBLIC_KEY_HERE`

---

### 6. First Release

#### 6.1 Commit Changes

```bash
git add .
git commit -m "feat: add auto-updater"
git push
```

#### 6.2 Create Release Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

#### 6.3 Monitor Build

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Watch the "Release" workflow (~10-15 minutes)

#### 6.4 Verify Release

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest`
2. Check for:
   - Platform installers (`.nsis.zip`, `.app.tar.gz`, `.AppImage.tar.gz`)
   - Signature files (`.sig`)
   - `latest.json` file

---

## Testing

### Test Update Flow

1. **Install v1.0.0** on your computer
2. **Update version** to `1.0.1` in `tauri.conf.json`
3. **Commit and create tag**:
   ```bash
   git add src-tauri/tauri.conf.json
   git commit -m "chore: bump version to 1.0.1"
   git push
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. **Wait for release** to complete
5. **Launch v1.0.0 app** - Update dialog should appear!

---

## Troubleshooting

### Build Fails: "Private key not found"

**Solution:**

```bash
# Verify environment variable
echo $TAURI_SIGNING_PRIVATE_KEY  # macOS/Linux
echo $env:TAURI_SIGNING_PRIVATE_KEY  # Windows

# If empty, set it again and restart terminal
```

### GitHub Actions Fails

**Check:**

1. Secret exists: `Settings → Secrets → Actions`
2. Secret name is exactly: `TAURI_SIGNING_PRIVATE_KEY`
3. View logs: `Actions` tab → Click failed workflow

### Update Not Detected

**Check:**

1. `latest.json` exists at endpoint URL
2. Version in `latest.json` > current version
3. Public key in config matches private key
4. App is in production mode (not dev)

### Signature Validation Fails

**Check:**

1. Public key in config matches private key used for signing
2. Signature file content is complete (not truncated)
3. Artifact wasn't modified after signing

---

## Best Practices

### Security

- ✅ Never commit private keys to version control
- ✅ Use HTTPS endpoints only (enforced in production)
- ✅ Store private keys in secure password managers
- ✅ Rotate keys periodically
- ✅ Monitor signature validation failures

### User Experience

- ✅ Check for updates in background (don't block startup)
- ✅ Allow users to defer updates
- ✅ Show release notes in update dialog
- ✅ Display download progress
- ✅ Handle errors gracefully with retry option

### Release Process

- ✅ Use semantic versioning (v1.0.0, v1.0.1, v2.0.0)
- ✅ Test updates in staging before production
- ✅ Keep release notes informative
- ✅ Monitor update success rates
- ✅ Have rollback strategy for failed updates

### Repository

- ✅ **Public repository recommended** for easier updates
- ✅ Private repos require authentication setup
- ✅ Keep releases organized with proper tags
- ✅ Archive old releases to save space

---

## Additional Resources

- **Tauri Updater Docs**: https://v2.tauri.app/plugin/updater/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Semantic Versioning**: https://semver.org/

---

## Summary

This implementation provides:

- ✅ Automatic updates with zero server costs
- ✅ Cryptographic security
- ✅ Multi-platform support
- ✅ Professional user experience
- ✅ Easy maintenance

**Total setup time**: ~30 minutes  
**Ongoing maintenance**: Minimal (just create tags for releases)

---

**License**: This guide can be used freely for any Tauri project.
