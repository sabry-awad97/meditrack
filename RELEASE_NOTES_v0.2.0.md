# Release v0.2.0 - MediTrack Rebrand & Internationalization

## 🎯 Major Changes

### Rebrand to MediTrack

- **New Identity**: Renamed from "Medi Order" to "MediTrack" to reflect comprehensive pharmacy management capabilities
- **Updated Branding**: All interfaces, documentation, and configurations updated with new name
- **AI-Powered Positioning**: Positioned as "Professional Pharmacy Management System with AI"
- **New Package Names**: All workspace packages renamed to `@meditrack/*`

### Complete Internationalization System

- Added comprehensive i18n package with Arabic and English support
- 443 translation keys per language across 7 namespaces
- Type-safe translation hooks with TypeScript
- Full RTL (Arabic) and LTR (English) layout support

### Language Switcher

- Toggle between Arabic and English in sidebar
- Automatic layout direction switching
- Persistent language preference in local storage

### Direction-Aware UI

- Sidebar position: Right (Arabic) / Left (English)
- Arrow icons flip based on text direction
- Automatic text alignment for all components

## 🎨 Improvements

- Renamed `/pharmacy` route to `/special-orders` for clarity
- Enhanced all components with i18n support
- Added Zod validation with localized error messages
- Improved code organization and type safety
- Updated meta tags and SEO descriptions

## 📊 Statistics

- **Files Changed**: 83 files
- **Lines Added**: 3,713 lines
- **New Package**: @meditrack/i18n
- **Supported Languages**: 2 (Arabic, English)
- **Translation Keys**: 443 per language

## 🚀 Installation

### For New Users

Download and run the installer:

- **Windows**: `meditrack_0.2.0_x64-setup.exe`
- **MSI Package**: `meditrack_0.2.0_x64_en-US.msi`

### For Existing Users (v0.1.0)

Automatic update available! Simply launch the app and you'll be prompted to update.

## ⚠️ Breaking Changes

### For Users

- Language preference will reset on first launch (minor inconvenience)
- Application name changed from "medi-order" to "meditrack"

### For Developers

- All package imports must use new `@meditrack/*` namespace
- Storage key changed from `medi-order-locale` to `meditrack-locale`
- GitHub repository renamed to `meditrack`

## 📝 Migration Notes

If you're upgrading from v0.1.0:

1. Your data will be preserved automatically
2. You may need to reselect your language preference
3. All settings and orders remain intact

## 🔐 Security

- Signed installers with Tauri updater
- Secure auto-update mechanism
- All releases cryptographically signed

## 📦 Build Artifacts

This release includes:

- Windows NSIS Installer (`.exe`)
- Windows MSI Package (`.msi`)
- Cryptographic signatures for auto-updates

## 🙏 Acknowledgments

Thank you for using MediTrack! This rebrand marks an important milestone in our journey to provide comprehensive pharmacy management solutions.

---

**Full Changelog**: https://github.com/sabry-awad97/meditrack/compare/v0.1.0...v0.2.0
