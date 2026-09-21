#!/usr/bin/env bash
# ==============================================================================
# Rectangle Min - Installer & Configuration Script
# Works across Ubuntu 24.04+, Debian, Fedora 40+, Arch, and CentOS/RHEL.
# Optimized for local desktop and low-latency macOS RDP / VNC sessions.
# ==============================================================================
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

UUID="rectangle-min@akpower"
OLD_UUID="rectangle@acristoffers.me"
EXT_BASE_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions"
DEST_DIR="${EXT_BASE_DIR}/${UUID}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ------------------------------------------------------------------------------
# Uninstall Routine
# ------------------------------------------------------------------------------
if [[ "$1" == "--uninstall" || "$1" == "-u" ]]; then
  echo -e "${YELLOW}${BOLD}==> Uninstalling Rectangle Min (${UUID})...${NC}"

  # Disable extension in GNOME Shell
  gnome-extensions disable "$UUID" 2>/dev/null || true

  # Remove from enabled-extensions
  CURRENT_EXTS=$(gsettings get org.gnome.shell enabled-extensions 2>/dev/null || echo "[]")
  if echo "$CURRENT_EXTS" | grep -q "$UUID"; then
    CLEANED_EXTS=$(echo "$CURRENT_EXTS" | sed "s/'$UUID'//g; s/, ,/,/g; s/\[, /[/g; s/, \]/]/g; s/\[ \]/[]/g")
    gsettings set org.gnome.shell enabled-extensions "$CLEANED_EXTS" 2>/dev/null || true
  fi

  # Delete installed files
  if [[ -d "$DEST_DIR" ]]; then
    rm -rf "$DEST_DIR"
    echo "--> Removed extension directory: $DEST_DIR"
  fi

  echo -e "${GREEN}${BOLD}[OK] Rectangle Min uninstalled successfully.${NC}"
  exit 0
fi

# ------------------------------------------------------------------------------
# Install Routine
# ------------------------------------------------------------------------------
echo -e "${BLUE}${BOLD}==> Installing Rectangle Min (${UUID})...${NC}"

# Ensure source files exist
if [[ ! -f "$SCRIPT_DIR/extension.js" || ! -f "$SCRIPT_DIR/metadata.json" ]]; then
  echo -e "${RED}Error: Cannot find extension source files in ${SCRIPT_DIR}${NC}"
  exit 1
fi

# Create target directory
echo "--> Deploying files to ${DEST_DIR}..."
mkdir -p "$DEST_DIR"
cp -r "$SCRIPT_DIR/extension.js" "$DEST_DIR/"
cp -r "$SCRIPT_DIR/metadata.json" "$DEST_DIR/"
cp -r "$SCRIPT_DIR/stylesheet.css" "$DEST_DIR/"
cp -r "$SCRIPT_DIR/schemas" "$DEST_DIR/"
cp -r "$SCRIPT_DIR/icons" "$DEST_DIR/"

# Compile GSettings schema
echo "--> Compiling GSettings schemas..."
glib-compile-schemas "$DEST_DIR/schemas"

# Fix permissions and SELinux contexts (crucial on Fedora / RHEL)
echo "--> Applying file permissions and security contexts..."
chmod -R a+rX "$DEST_DIR"
if command -v restorecon &>/dev/null; then
  restorecon -RF "$DEST_DIR" 2>/dev/null || true
fi

# Disable old bloated upstream extension if present to avoid shortcut conflicts
CURRENT_EXTS=$(gsettings get org.gnome.shell enabled-extensions 2>/dev/null || echo "[]")
if echo "$CURRENT_EXTS" | grep -q "$OLD_UUID"; then
  echo "--> Disabling old upstream extension (${OLD_UUID})..."
  gnome-extensions disable "$OLD_UUID" 2>/dev/null || true
  CLEANED_EXTS=$(echo "$CURRENT_EXTS" | sed "s/'$OLD_UUID'//g; s/, ,/,/g; s/\[, /[/g; s/, \]/]/g; s/\[ \]/[]/g")
  CURRENT_EXTS="$CLEANED_EXTS"
fi

# Add rectangle-min to enabled-extensions
echo "--> Enabling Rectangle Min in GNOME Shell..."
if ! echo "$CURRENT_EXTS" | grep -q "$UUID"; then
  if [[ "$CURRENT_EXTS" == "@as []" || "$CURRENT_EXTS" == "[]" || -z "$CURRENT_EXTS" ]]; then
    gsettings set org.gnome.shell enabled-extensions "['$UUID']"
  else
    NEW_EXTS=$(echo "$CURRENT_EXTS" | sed "s/]/, '$UUID']/")
    gsettings set org.gnome.shell enabled-extensions "$NEW_EXTS"
  fi
else
  # Write back cleaned extensions if old was removed
  gsettings set org.gnome.shell enabled-extensions "$CURRENT_EXTS" 2>/dev/null || true
fi

# Activate extension live via gnome-extensions CLI
gnome-extensions enable "$UUID" 2>/dev/null || true

# ------------------------------------------------------------------------------
# System & Mutter Optimizations for Low Latency and Shortcut Unblocking
# ------------------------------------------------------------------------------
echo "--> Optimizing Mutter & unbinding conflicting window/workspace shortcuts..."

# Center new windows nicely
gsettings set org.gnome.mutter center-new-windows true 2>/dev/null || true

# Disable Super overlay key hijacking (essential over RDP)
gsettings set org.gnome.mutter overlay-key '' 2>/dev/null || true

# Free Shift+Overview keybindings
dconf write /org/gnome/shell/keybindings/shift-overview-up "@as []" 2>/dev/null || true
dconf write /org/gnome/shell/keybindings/shift-overview-down "@as []" 2>/dev/null || true

# Free conflicting workspace switching/moving shortcuts so Alt+Shift+Arrows work cleanly
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-up "@as []" 2>/dev/null || true
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-down "@as []" 2>/dev/null || true
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-left "['<Super>Page_Up']" 2>/dev/null || true
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-right "['<Super>Page_Down']" 2>/dev/null || true

gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-up "@as []" 2>/dev/null || true
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-down "@as []" 2>/dev/null || true
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-left "['<Super><Shift>Page_Up']" 2>/dev/null || true
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-right "['<Super><Shift>Page_Down']" 2>/dev/null || true

echo ""
echo -e "${GREEN}${BOLD}✓ Rectangle Min installed and active!${NC}"
echo ""
echo -e "${BOLD}Shortcuts (macOS RDP & Native Linux):${NC}"
echo "  ⌃ + ⌥ + ⇧ + ↩ (Return)  : Almost Maximize (with padding)"
echo "  ⌃ + ⌥ + ⇧ + M          : Full Maximize"
echo "  ⌃ + ⌥ + ⇧ + C          : Center Window (preserves size)"
echo "  ⌃ + ⌥ + ⇧ + [          : Left 3/4"
echo "  ⌃ + ⌥ + ⇧ + ]          : Right 3/4"
echo "  ⌃ + ⌥ + ⇧ + H / L / K / J : Half Screen (Left/Right/Top/Bottom - Vim style)
  ⌃ + ⌥ + ⇧ + ← / → / ↑ / ↓ : Half Screen (Arrows fallback)"
echo ""
echo "Note: If running under Wayland without extension hot-reloading, log out & back in or reconnect RDP."
