// ==============================================================================
// Rectangle Min - High-performance, minimal window tiling for GNOME Shell
// Supports GNOME 45, 46, 47, 48 (ES Module format)
// ==============================================================================

import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

class ShortcutsManager {
    constructor() {
        this._keybindings = new Map();
        this._acceleratorActivatedId = global.display.connect(
            'accelerator-activated',
            this._onAcceleratorActivated.bind(this)
        );
    }

    _onAcceleratorActivated(_display, action, _deviceId, _timestamp) {
        try {
            const binding = this._keybindings.get(action);
            binding?.callback();
        } catch (e) {
            console.error(`[RectangleMin] Error executing shortcut: ${e}`);
        }
    }

    add(accelerator, callback) {
        let action = Meta.KeyBindingAction.NONE;
        action = global.display.grab_accelerator(accelerator, 0);
        if (action !== Meta.KeyBindingAction.NONE) {
            const name = Meta.external_binding_name_for_action(action);
            if (name != null) {
                Main.wm.allowKeybinding(name, Shell.ActionMode.ALL);
                this._keybindings.set(action, { name, callback });
            }
            return action;
        }
        return 0;
    }

    remove(action) {
        try {
            const binding = this._keybindings.get(action);
            if (binding != null) {
                global.display.ungrab_accelerator(action);
                Main.wm.allowKeybinding(binding.name, Shell.ActionMode.NONE);
                this._keybindings.delete(action);
            }
        } catch (e) {
            console.error(`[RectangleMin] Error removing shortcut: ${e.message}`);
        }
    }

    removeAll() {
        for (const action of Array.from(this._keybindings.keys())) {
            this.remove(action);
        }
    }

    destroy() {
        if (this._acceleratorActivatedId) {
            global.display.disconnect(this._acceleratorActivatedId);
            this._acceleratorActivatedId = 0;
        }
        this.removeAll();
    }
}

export default class RectangleMinExtension extends Extension {
    enable() {
        this._keyManager = new ShortcutsManager();
        this._shortcuts = new Map();
        this._gsettings = this.getSettings();
        this._gsettings.connectObject('changed', this._onSettingsChanged.bind(this));

        this._registerAllShortcuts();

        if (this._gsettings.get_boolean('show-icon')) {
            this._setupMenu();
        }
    }

    disable() {
        this._shortcuts?.clear();
        this._keyManager?.destroy();
        this._keyManager = null;

        this._gsettings?.disconnectObject(this._gsettings);
        this._gsettings = null;

        this._menu?.destroy();
        this._menu = null;
    }

    _focusedWindow() {
        return global.display.focus_window || global.display.focusWindow;
    }

    _workArea(app) {
        const workarea = app.get_work_area_current_monitor();
        return {
            x: workarea.x,
            y: workarea.y,
            width: workarea.width,
            height: workarea.height,
        };
    }

    _applyGeometry(app, target) {
        let wasMaximized = false;

        if (app.is_fullscreen ? app.is_fullscreen() : app.fullscreen) {
            app.unmake_fullscreen();
            wasMaximized = true;
        }

        if (app.maximized_horizontally || app.maximized_vertically || (app.get_maximized && app.get_maximized() !== 0)) {
            app.unmaximize(Meta.MaximizeFlags.BOTH);
            wasMaximized = true;
        }

        const resize = () => {
            app.move_resize_frame(
                false,
                Math.round(target.x),
                Math.round(target.y),
                Math.round(target.width),
                Math.round(target.height)
            );
        };

        if (wasMaximized) {
            GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                resize();
                return GLib.SOURCE_REMOVE;
            });
        } else {
            resize();
        }
    }

    // Window Actions
    tileMaximizeAlmost() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        const pad = this._gsettings?.get_int('padding-outer') ?? 8;
        this._applyGeometry(app, {
            x: area.x + pad,
            y: area.y + pad,
            width: area.width - (2 * pad),
            height: area.height - (2 * pad),
        });
    }

    tileMaximize() {
        const app = this._focusedWindow();
        if (!app) return;
        if (app.is_fullscreen ? app.is_fullscreen() : app.fullscreen) {
            app.unmake_fullscreen();
        }
        app.maximize(Meta.MaximizeFlags.BOTH);
    }

    tileCenter() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        const win = app.get_frame_rect();
        this._applyGeometry(app, {
            x: area.x + Math.round((area.width - win.width) / 2),
            y: area.y + Math.round((area.height - win.height) / 2),
            width: win.width,
            height: win.height,
        });
    }

    tileThreeFourthsLeft() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        this._applyGeometry(app, {
            x: area.x,
            y: area.y,
            width: Math.round(area.width * 0.75),
            height: area.height,
        });
    }

    tileThreeFourthsRight() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        const startX = Math.round(area.width * 0.25);
        this._applyGeometry(app, {
            x: area.x + startX,
            y: area.y,
            width: area.width - startX,
            height: area.height,
        });
    }

    tileHalfLeft() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        this._applyGeometry(app, {
            x: area.x,
            y: area.y,
            width: Math.round(area.width * 0.5),
            height: area.height,
        });
    }

    tileHalfRight() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        const halfW = Math.round(area.width * 0.5);
        this._applyGeometry(app, {
            x: area.x + halfW,
            y: area.y,
            width: area.width - halfW,
            height: area.height,
        });
    }

    tileHalfTop() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        this._applyGeometry(app, {
            x: area.x,
            y: area.y,
            width: area.width,
            height: Math.round(area.height * 0.5),
        });
    }

    tileHalfBottom() {
        const app = this._focusedWindow();
        if (!app) return;
        const area = this._workArea(app);
        const halfH = Math.round(area.height * 0.5);
        this._applyGeometry(app, {
            x: area.x,
            y: area.y + halfH,
            width: area.width,
            height: area.height - halfH,
        });
    }

    _getActionMap() {
        return {
            'tile-maximize-almost': () => this.tileMaximizeAlmost(),
            'tile-maximize': () => this.tileMaximize(),
            'tile-center': () => this.tileCenter(),
            'tile-three-fourths-left': () => this.tileThreeFourthsLeft(),
            'tile-three-fourths-right': () => this.tileThreeFourthsRight(),
            'tile-half-left': () => this.tileHalfLeft(),
            'tile-half-right': () => this.tileHalfRight(),
            'tile-half-top': () => this.tileHalfTop(),
            'tile-half-bottom': () => this.tileHalfBottom(),
        };
    }

    _registerShortcut(key, handler) {
        const prevActions = this._shortcuts.get(key);
        if (prevActions != null) {
            for (const act of prevActions) {
                this._keyManager?.remove(act);
            }
            this._shortcuts.delete(key);
        }

        const shortcuts = this._gsettings?.get_strv(key) ?? [];
        const registered = [];
        for (const shortcut of shortcuts) {
            if (shortcut && shortcut.length > 0) {
                const action = this._keyManager?.add(shortcut, handler);
                if (action != null && action > 0) {
                    registered.push(action);
                }
            }
        }
        if (registered.length > 0) {
            this._shortcuts.set(key, registered);
        }
    }

    _registerAllShortcuts() {
        const map = this._getActionMap();
        for (const [key, handler] of Object.entries(map)) {
            this._registerShortcut(key, handler);
        }
    }

    _onSettingsChanged(_settings, key) {
        if (key === 'show-icon') {
            const showIcon = this._gsettings?.get_boolean('show-icon') ?? true;
            if (showIcon && !this._menu) {
                this._setupMenu();
            } else if (!showIcon && this._menu) {
                this._menu.destroy();
                this._menu = null;
            }
            return;
        }

        const map = this._getActionMap();
        if (map[key]) {
            this._registerShortcut(key, map[key]);
        }
    }

    _setupMenu() {
        if (this._menu) return;

        this._menu = new PanelMenu.Button(0.0, 'RectangleMin', false);
        const icon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${this.path}/icons/rectangle.svg`),
            styleClass: 'system-status-icon',
        });
        const box = new St.BoxLayout();
        box.add_child(icon);
        this._menu.add_child(box);

        const menu = this._menu.menu;

        const addMenuItem = (label, handler, shortcutBadge) => {
            const item = new PopupMenu.PopupMenuItem(label);
            if (shortcutBadge) {
                const badge = new St.Label({
                    text: shortcutBadge,
                    styleClass: 'menu-shortcut-badge',
                    xAlign: Clutter.ActorAlign.END,
                    xExpand: true,
                    yAlign: Clutter.ActorAlign.CENTER,
                });
                item.add_child(badge);
            }
            item.connectObject('activate', () => handler());
            menu.addMenuItem(item);
        };

        addMenuItem('Almost Maximize', () => this.tileMaximizeAlmost(), '⌃⌥⇧↩');
        addMenuItem('Maximize', () => this.tileMaximize(), '⌃⌥⇧M');
        addMenuItem('Center Window', () => this.tileCenter(), '⌃⌥⇧C');
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        addMenuItem('Left 3/4', () => this.tileThreeFourthsLeft(), '⌃⌥⇧[');
        addMenuItem('Right 3/4', () => this.tileThreeFourthsRight(), '⌃⌥⇧]');
        menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        addMenuItem('Left Half', () => this.tileHalfLeft(), '⌃⌥⇧H');
        addMenuItem('Right Half', () => this.tileHalfRight(), '⌃⌥⇧L');
        addMenuItem('Top Half', () => this.tileHalfTop(), '⌃⌥⇧K');
        addMenuItem('Bottom Half', () => this.tileHalfBottom(), '⌃⌥⇧J');

        Main.panel.addToStatusArea('RectangleMin', this._menu, 1);
    }
}
