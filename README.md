# Rectangle Min (`rectangle-min@akpower`)

> Minimal, high-performance window tiling for GNOME Shell with macOS Rectangle shortcuts and 0ms-latency remote desktop (RDP/VNC) optimization.

[![GNOME Shell 45-48](https://img.shields.io/badge/GNOME%20Shell-45%20|%2046%20|%2047%20|%2048-blue.svg)](https://gjs.guide/extensions/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20GJS)-orange.svg)]()

---

## Highlights

- **macOS Muscle Memory Parity**: Uses standardized `⌃⌥⇧` (`Control + Option + Shift`) combinations that pass cleanly through Microsoft Remote Desktop, Jump Desktop, Remmina, and native macOS window managers without host OS interception.
- **Wayland / Mutter Stability**: Resolves the unmaximize crash on maximized GTK4 / Wayland windows by using safe `Meta.MaximizeFlags.BOTH` and deferred idle resizing (`GLib.idle_add`).
- **Zero Latency (Instant Tiling)**: Pure GJS ES module (~350 lines) directly interfacing with Mutter C APIs. No npm/node build chains, no heavy abstractions, and no software animation loops that lag over remote connections.
- **Sleek Native Panel Dropdown**: Clean, theme-adaptive GNOME Shell top-bar menu showing your active actions and shortcut badges.
- **True Center Preservation**: The Center action strictly preserves your window's existing dimensions without resizing or shrinking.
- **Cross-Distro Ready**: Tested across Ubuntu 24.04/22.04, Fedora 40/41 (with automatic SELinux `restorecon`), Debian, Arch Linux, and RDP sessions.

---

## Shortcuts Reference

All default shortcuts use the ergonomic `⌃ + ⌥ + ⇧` (`Control + Option + Shift`) prefix:

| Action | macOS Shortcut | Linux Accelerator | Description |
| :--- | :--- | :--- | :--- |
| **Almost Maximize** | `⌃ + ⌥ + ⇧ + Return` | `<Ctrl><Alt><Shift>Return` | Maximizes with an 8px configurable outer margin |
| **Full Maximize** | `⌃ + ⌥ + ⇧ + M` | `<Ctrl><Alt><Shift>M` | Native Mutter full maximize |
| **Center Window** | `⌃ + ⌥ + ⇧ + C` | `<Ctrl><Alt><Shift>C` | Centers window on monitor without altering size |
| **Left 3/4** | `⌃ + ⌥ + ⇧ + [` | `<Ctrl><Alt><Shift>bracketleft` | Snaps window to left 75% of monitor |
| **Right 3/4** | `⌃ + ⌥ + ⇧ + ]` | `<Ctrl><Alt><Shift>bracketright` | Snaps window to right 75% of monitor |
| **Left Half** | `⌃ + ⌥ + ⇧ + ←` | `<Ctrl><Alt><Shift>Left` | Snaps window to left 50% |
| **Right Half** | `⌃ + ⌥ + ⇧ + →` | `<Ctrl><Alt><Shift>Right` | Snaps window to right 50% |
| **Top Half** | `⌃ + ⌥ + ⇧ + ↑` | `<Ctrl><Alt><Shift>Up` | Snaps window to top 50% |
| **Bottom Half** | `⌃ + ⌥ + ⇧ + ↓` | `<Ctrl><Alt><Shift>Down` | Snaps window to bottom 50% |

> [!TIP]
> Secondary bindings (such as `<Ctrl><Super><Shift>` and `<Ctrl><Alt>`) are also mapped in the schema for environments where the `Option` key is forwarded as `Super`.

---

## Installation

### Method 1: Git Clone (Recommended)

```bash
git clone https://github.com/akpw/gnome-rectangle-min.git ~/.local/share/gnome-shell/extensions/rectangle-min@akpower
cd ~/.local/share/gnome-shell/extensions/rectangle-min@akpower
./install.sh
```

### Method 2: Using Makefile

```bash
git clone https://github.com/akpw/gnome-rectangle-min.git
cd gnome-rectangle-min
make install
```

The installer automatically:
1. Compiles the GSettings schema.
2. Applies appropriate permissions and SELinux contexts (on Fedora / RHEL).
3. Safely unbinds conflicting GNOME workspace switching/moving arrow shortcuts.
4. Enables the extension in GNOME Shell.

> [!NOTE]
> If you are running under a Wayland session where GNOME Shell does not reload extensions dynamically, log out and back in (or reconnect your RDP session) once.

---

## Configuration

Settings are managed natively via GSettings:

```bash
# Adjust outer padding for "Almost Maximize" (default: 8px)
gsettings set org.gnome.shell.extensions.rectangle-min padding-outer 12

# Hide the top bar panel icon (shortcuts still remain active)
gsettings set org.gnome.shell.extensions.rectangle-min show-icon false

# View current shortcut for Almost Maximize
gsettings get org.gnome.shell.extensions.rectangle-min tile-maximize-almost
```

---

## Uninstallation

To remove the extension and restore defaults:

```bash
./install.sh --uninstall
# or
make uninstall
```

---

## Why Rectangle Min over Upstream?

1. **Elimination of Mutter Crash**: Upstream extensions invoke `app.unmaximize()` without arguments or without deferring geometry application, causing GNOME Shell / Mutter to crash or freeze on Wayland when resizing previously maximized windows.
2. **Zero Overhead**: Legacy extensions often bundle multi-megabyte TypeScript compilers, bloated utility libraries, 60+ unused layout permutations, and a software redraw loop for animations that chokes RDP sessions. `Rectangle Min` is under 400 lines of modern, auditable JavaScript with zero background CPU/memory footprint.
3. **No Shortcut Clashing**: Cleanly designed to avoid conflicts with macOS Mission Control / Spaces and GNOME Shell workspace navigators.

---

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.
