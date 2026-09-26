# Rectangle Min (`rectangle-min@akpower`)

Window tiling for GNOME Shell implementing common actions inspired by macOS [Rectangle](https://rectangleapp.com/).

[![GNOME Shell 45-48](https://img.shields.io/badge/GNOME%20Shell-45%20|%2046%20|%2047%20|%2048-blue.svg)](https://gjs.guide/extensions/)
[![License: GPL v2+](https://img.shields.io/badge/License-GPL%20v2+-green.svg)](LICENSE)

---

## Shortcuts

Default shortcuts use `⌃ + ⌥ + ⇧` (`Control + Option + Shift`):

| Action | macOS Shortcut | Linux Accelerator | Description |
| :--- | :--- | :--- | :--- |
| **Almost Maximize** | `⌃ + ⌥ + ⇧ + Return` | `<Ctrl><Alt><Shift>Return` | Maximizes with an 8px configurable outer margin |
| **Full Maximize** | `⌃ + ⌥ + ⇧ + M` | `<Ctrl><Alt><Shift>M` | Mutter full maximize |
| **Center Window** | `⌃ + ⌥ + ⇧ + C` | `<Ctrl><Alt><Shift>C` | Centers window on monitor without altering size |
| **Left 3/4** | `⌃ + ⌥ + ⇧ + [` | `<Ctrl><Alt><Shift>bracketleft` | Snaps window to left 75% |
| **Right 3/4** | `⌃ + ⌥ + ⇧ + ]` | `<Ctrl><Alt><Shift>bracketright` | Snaps window to right 75% |
| **Left Half** | `⌃ + ⌥ + ⇧ + H` | `<Ctrl><Alt><Shift>H` | Snaps window to left 50% (Vim `h`) |
| **Right Half** | `⌃ + ⌥ + ⇧ + L` | `<Ctrl><Alt><Shift>L` | Snaps window to right 50% (Vim `l`) |
| **Top Half** | `⌃ + ⌥ + ⇧ + K` | `<Ctrl><Alt><Shift>K` | Snaps window to top 50% (Vim `k`) |
| **Bottom Half** | `⌃ + ⌥ + ⇧ + J` | `<Ctrl><Alt><Shift>J` | Snaps window to bottom 50% (Vim `j`) |

Arrow keys and `<Ctrl><Super><Shift>` variations are also included as fallback bindings in the schema.

---

## Installation

```bash
git clone https://github.com/akpw/gnome-rectangle-min.git ~/.local/share/gnome-shell/extensions/rectangle-min@akpower
cd ~/.local/share/gnome-shell/extensions/rectangle-min@akpower
./install.sh
```

Or using `make`:

```bash
git clone https://github.com/akpw/gnome-rectangle-min.git
cd gnome-rectangle-min
make install
```

`install.sh`:
- Compiles the GSettings schema
- Sets permissions and SELinux contexts (on Fedora / RHEL)
- Disables conflicting GNOME workspace switching/moving arrow shortcuts
- Enables the extension

If running Wayland, log out and back in (or reconnect RDP) for GNOME Shell to load the extension.

---

## Configuration

Settings are managed via GSettings:

```bash
# Outer padding for "Almost Maximize" (default: 8px)
gsettings set org.gnome.shell.extensions.rectangle-min padding-outer 12

# Toggle top bar panel icon
gsettings set org.gnome.shell.extensions.rectangle-min show-icon false

# Read current shortcut for Almost Maximize
gsettings get org.gnome.shell.extensions.rectangle-min tile-maximize-almost
```

---

## Uninstallation

```bash
./install.sh --uninstall
# or
make uninstall
```

---

## License

GNU General Public License v2.0 or later. See [LICENSE](LICENSE).
