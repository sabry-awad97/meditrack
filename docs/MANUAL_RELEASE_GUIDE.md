# Manual Release Guide (Without GitHub Actions)

Since GitHub Actions requires billing, you can build and release manually.

## Prerequisites

✅ Environment variable `TAURI_SIGNING_PRIVATE_KEY` is set (run `.\set-signing-key.ps1`)
✅ Terminal restarted after setting environment variable

## Step 1: Build the Application

```bash
cd apps/web
bun run desktop:build
```

This will create signed installers in:

- Windows: `src-tauri/target/release/bundle/nsis/`
- macOS: `src-tauri/target/release/bundle/macos/`
- Linux: `src-tauri/target/release/bundle/appimage/`

## Step 2: Locate Build Artifacts

After build completes, find these files:

### Windows

- `src-tauri/target/release/bundle/nsis/medi-order_0.1.0_x64-setup.nsis.zip`
- `src-tauri/target/release/bundle/nsis/medi-order_0.1.0_x64-setup.nsis.zip.sig`

### macOS (if building on Mac)

- `src-tauri/target/release/bundle/macos/medi-order_0.1.0_x64.app.tar.gz`
- `src-tauri/target/release/bundle/macos/medi-order_0.1.0_x64.app.tar.gz.sig`

### Linux (if building on Linux)

- `src-tauri/target/release/bundle/appimage/medi-order_0.1.0_amd64.AppImage.tar.gz`
- `src-tauri/target/release/bundle/appimage/medi-order_0.1.0_amd64.AppImage.tar.gz.sig`

## Step 3: Create latest.json

Create a file named `latest.json` with this content:

```json
{
  "version": "0.1.0",
  "notes": "Initial release with auto-updater support",
  "pub_date": "2026-01-29T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "PASTE_SIGNATURE_FROM_.SIG_FILE",
      "url": "https://github.com/sabry-awad97/medi-order/releases/download/v0.1.0/medi-order_0.1.0_x64-setup.nsis.zip"
    }
  }
}
```

**Get the signature:**

```bash
cat src-tauri/target/release/bundle/nsis/medi-order_0.1.0_x64-setup.nsis.zip.sig
```

Copy the entire output and paste it into the `signature` field.

## Step 4: Create GitHub Release Manually

1. Go to: https://github.com/sabry-awad97/medi-order/releases/new

2. Fill in:
   - **Tag**: `v0.1.0` (select existing tag)
   - **Title**: `v0.1.0 - Initial Release`
   - **Description**: Copy from `RELEASE_NOTES.md`

3. **Upload files** (drag and drop):
   - The `.nsis.zip` file (installer)
   - The `.nsis.zip.sig` file (signature)
   - The `latest.json` file

4. Click "Publish release"

## Step 5: Test the Update

1. Install the v0.1.0 build
2. Update version to 0.1.1 in `tauri.conf.json`
3. Build again
4. Create v0.1.1 release with new files
5. Launch v0.1.0 app - update dialog should appear!

## Quick Commands

```bash
# Build
cd apps/web
bun run desktop:build

# View signature
cat src-tauri/target/release/bundle/nsis/*.sig

# Find build artifacts
ls src-tauri/target/release/bundle/nsis/
```

---

**Note**: You only need to build on your current platform (Windows).
Cross-platform builds require GitHub Actions or building on each platform separately.
