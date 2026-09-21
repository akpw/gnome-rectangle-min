# Rectangle Min (`rectangle-min@akpower`)

> Minimal, high-performance window tiling for GNOME Shell providing the most commonly used window actions inspired by macOS Rectangle.

[![GNOME Shell 45-48](https://img.shields.io/badge/GNOME%20Shell-45%20|%2046%20|%2047%20|%2048-blue.svg)](https://gjs.guide/extensions/)
[![License: GPL v2+](https://img.shields.io/badge/License-GPL%20v2+-green.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20GJS)-orange.svg)]()

---

## Overview

**Rectangle Min** is a lightweight, independent GNOME Shell extension providing a minimal, high-performance implementation of essential window tiling actions, inspired by the macOS [Rectangle](https://rectangleapp.com/) window manager.

It is engineered for simplicity, zero latency, and seamless muscle memory parity across macOS and Linux—especially when working over Remote Desktop (RDP/VNC) sessions or native Wayland desktops.

### Highlights

- **Focused Action Set**: Implements only the essential, high-frequency tiling actions (Almost Maximize, Full Maximize, True Center, 3/4 splits, and Halves) without dozens of unused layouts.
- **macOS Muscle Memory Parity**: Uses standardized `⌃⌥⇧` (`Control + Option + Shift`) combinations that pass cleanly through Microsoft Remote Desktop, Jump Desktop, Remmina, and native macOS window managers without host OS interception.
- **Wayland / Mutter Stability**: Rock-solid window geometry handling that safely unmaximizes and moves windows via native Mutter C APIs without freezing or crashing GNOME Shell.
- **Zero Latency (Instant Tiling)**: Pure GJS ES module (~360 lines) with zero third-party dependencies, zero build steps, and no software redraw animation loops.
- **Sleek Native Panel Dropdown**: Theme-adaptive GNOME Shell top-bar menu showing active actions and matching shortcut labels.
- **True Center Preservation**: The Center action strictly preserves your window's existing dimensions without resizing or shrinking.
- **Cross-Distro Ready**: Clean, single-command installation across Ubuntu, Fedora (with SELinux support), Debian, and Arch Linux.

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
| **Left Half** | `⌃ + ⌥ + ⇧ + H` | `<Ctrl><Alt><Shift>H` | Snaps window to left 50% (Vim `h`) |
| **Right Half** | `⌃ + ⌥ + ⇧ + L` | `<Ctrl><Alt><Shift>L` | Snaps window to right 50% (Vim `l`) |
| **Top Half** | `⌃ + ⌥ + ⇧ + K` | `<Ctrl><Alt><Shift>K` | Snaps window to top 50% (Vim `k`) |
| **Bottom Half** | `⌃ + ⌥ + ⇧ + J` | `<Ctrl><Alt><Shift>J` | Snaps window to bottom 50% (Vim `j`) |

> [!TIP]
> Secondary bindings (such as `<Ctrl><Super><Shift>` and arrow keys) are also mapped in the schema for environments where the `Option` key is forwarded as `Super`.

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

## License

This project is licensed under the terms of the GNU General Public License v2.0 or later - see the [LICENSE](LICENSE) file for details.
