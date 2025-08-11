import { app, nativeImage, Tray, Menu, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
let tray = null;
let overlay = null;
const isMac = process.platform === "darwin";
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:5050";
const DIAG = process.env.NEURODESK_DIAG === "1";
const fromHere = (rel) => fileURLToPath(new URL(rel, import.meta.url));
function getTrayIconPath() {
  const devPath = path.join(process.cwd(), "public", "trayTemplate.png");
  const prodPath = path.join(process.resourcesPath, "public", "trayTemplate.png");
  const p = app.isPackaged ? prodPath : devPath;
  if (DIAG) console.log("[Neurodesk] Tray icon expected at:", p);
  if (!fs.existsSync(p)) console.error("[Neurodesk] Tray icon NOT FOUND at:", p);
  return p;
}
function createTray() {
  const iconPath = getTrayIconPath();
  let icon = nativeImage.createFromPath(iconPath);
  if (!icon.isEmpty()) icon = icon.resize({ width: 18, height: 18, quality: "best" });
  icon.setTemplateImage(false);
  tray = new Tray(icon);
  if (DIAG) console.log("[Neurodesk] Tray created");
  tray.setTitle(" ND ");
  const menu = Menu.buildFromTemplate([
    {
      label: "Open Neurodesk",
      click: () => {
        if (!overlay || overlay.isDestroyed()) createOverlayWindow();
        overlay == null ? void 0 : overlay.show();
        overlay == null ? void 0 : overlay.focus();
      }
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() }
  ]);
  tray.setToolTip("Neurodesk");
  tray.setContextMenu(menu);
  tray.on("click", () => {
    if (!overlay || overlay.isDestroyed()) createOverlayWindow();
    else overlay.isVisible() ? overlay.hide() : overlay.show();
    overlay == null ? void 0 : overlay.focus();
  });
}
function createOverlayWindow() {
  if (overlay && !overlay.isDestroyed()) {
    overlay.show();
    overlay.focus();
    return;
  }
  const USE_TRANSPARENCY = false;
  overlay = new BrowserWindow({
    width: 760,
    height: 420,
    show: false,
    frame: false,
    transparent: USE_TRANSPARENCY,
    backgroundColor: "#151515",
    alwaysOnTop: true,
    fullscreenable: false,
    resizable: false,
    roundedCorners: true,
    vibrancy: void 0,
    // 'popover' is lighter than 'sidebar'
    visualEffectState: void 0,
    webPreferences: {
      preload: fromHere("./preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
      // devTools default: enabled but we won't auto-open them
    }
  });
  overlay.on("closed", () => {
    overlay = null;
  });
  const injected = process.env.ELECTRON_RENDERER_URL;
  const guess = "http://localhost:5173";
  const loadDev = async (url) => {
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(String(res.status));
      await overlay.loadURL(url);
      if (DIAG) console.log("[Neurodesk] Loaded renderer from", url);
      return true;
    } catch {
      if (DIAG) console.warn("[Neurodesk] Dev server not reachable at", url);
      return false;
    }
  };
  (async () => {
    let loaded = false;
    if (injected) {
      if (DIAG) console.log("[Neurodesk] ELECTRON_RENDERER_URL =", injected);
      loaded = await loadDev(injected);
    }
    if (!loaded) loaded = await loadDev(guess);
    if (!loaded) {
      const indexFile = fromHere("../index.html");
      if (DIAG) console.log("[Neurodesk] Falling back to file://", indexFile);
      await overlay.loadFile(indexFile);
    }
  })();
  overlay.webContents.on("did-finish-load", () => {
    if (DIAG) console.log("[Neurodesk] overlay did-finish-load");
    overlay == null ? void 0 : overlay.show();
    overlay == null ? void 0 : overlay.focus();
  });
  overlay.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.error("[Neurodesk] did-fail-load", { code, desc, url });
  });
}
function registerGlobalHotkey() {
  const combo = isMac ? "CommandOrControl+Shift+K" : "Control+Shift+K";
  const ok = globalShortcut.register(combo, () => {
    if (!overlay || overlay.isDestroyed()) createOverlayWindow();
    else overlay.isVisible() ? overlay.hide() : overlay.show();
    overlay == null ? void 0 : overlay.focus();
    overlay == null ? void 0 : overlay.webContents.send("overlay:focus-input");
  });
  if (!ok) console.error("[Neurodesk] Failed to register global hotkey");
}
function setupIPC() {
  ipcMain.on("overlay.close", () => overlay == null ? void 0 : overlay.hide());
  ipcMain.on("commands.run", async (_evt, text) => {
    try {
      await proxyCommand(text);
    } catch (e) {
      console.error("[Neurodesk] commands.run error:", e);
    }
  });
  ipcMain.handle("commands.runInvoke", async (_evt, text) => {
    try {
      const res = await proxyCommand(text);
      return { ok: true, data: res };
    } catch (e) {
      return { ok: false, error: (e == null ? void 0 : e.message) ?? String(e) };
    }
  });
}
async function proxyCommand(text) {
  const r = await fetch(`${BACKEND_URL}/commands/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Backend error ${r.status}: ${body}`);
  }
  return r.json();
}
function setupAppEvents() {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return;
  }
  app.on("second-instance", () => {
    if (overlay) {
      if (overlay.isMinimized()) overlay.restore();
      overlay.focus();
    }
  });
  app.on("window-all-closed", (e) => {
    e.preventDefault();
  });
  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
}
app.whenReady().then(() => {
  if (DIAG) console.log("[Neurodesk] App ready");
  createTray();
  createOverlayWindow();
  registerGlobalHotkey();
  setupIPC();
  setupAppEvents();
});
