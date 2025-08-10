// frontend/electron/main.ts
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
  nativeImage,
} from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

let tray: Tray | null = null
let overlay: BrowserWindow | null = null

const isMac = process.platform === 'darwin'
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:5050'

// ---- Diagnostics (turn off after things work) ----
const DIAG = true
app.disableHardwareAcceleration()

// ---- ESM-safe helper ----
const fromHere = (rel: string) => fileURLToPath(new URL(rel, import.meta.url))

// ---- Tray icon path (dev + prod) ----
function getTrayIconPath(): string {
  const devPath = path.join(process.cwd(), 'public', 'trayTemplate.png')
  const prodPath = path.join(process.resourcesPath, 'public', 'trayTemplate.png')
  const p = app.isPackaged ? prodPath : devPath
  console.log('[Neurodesk] Tray icon expected at:', p)
  if (!fs.existsSync(p)) console.error('[Neurodesk] Tray icon NOT FOUND at:', p)
  return p
}

function createTray() {
  const iconPath = getTrayIconPath()
  let icon = nativeImage.createFromPath(iconPath)
  if (!icon.isEmpty()) icon = icon.resize({ width: 18, height: 18, quality: 'best' })
  icon.setTemplateImage(false)

  tray = new Tray(icon)
  console.log('[Neurodesk] Tray created')
  tray.setTitle(' ND ') // remove once confirmed visible

  const menu = Menu.buildFromTemplate([
    {
      label: 'Open Neurodesk',
      click: () => {
        if (!overlay) createOverlayWindow()
        overlay?.show(); overlay?.focus()
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])
  tray.setToolTip('Neurodesk')
  tray.setContextMenu(menu)
  tray.on('click', () => {
    if (!overlay || overlay.isDestroyed()) createOverlayWindow()
    else overlay.isVisible() ? overlay.hide() : overlay.show()
    overlay?.focus()
  })
}

// ---- Overlay window ----
function createOverlayWindow() {
  if (overlay && !overlay.isDestroyed()) {
    overlay.show(); overlay.focus()
    return
  }

  overlay = new BrowserWindow({
    width: 760,
    height: 420,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    fullscreenable: false,
    resizable: false,
    roundedCorners: true,
    vibrancy: process.platform === 'darwin' ? 'sidebar' : undefined,
    visualEffectState: process.platform === 'darwin' ? 'active' : undefined,
    webPreferences: {
      preload: fromHere('./preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // devTools: false // enable only when needed
    },
  })
  

  // Dev server detection
  const injected = process.env.ELECTRON_RENDERER_URL
  const guess = 'http://localhost:5173'

  const loadDev = async (url: string) => {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) throw new Error(String(res.status))
      await overlay!.loadURL(url)
      console.log('[Neurodesk] Loaded renderer from', url)
      return true
    } catch {
      console.warn('[Neurodesk] Dev server not reachable at', url)
      return false
    }
  }

  ;(async () => {
    let loaded = false
    if (injected) {
      console.log('[Neurodesk] ELECTRON_RENDERER_URL =', injected)
      loaded = await loadDev(injected)
    }
    if (!loaded) loaded = await loadDev(guess)
    if (!loaded) {
      const indexFile = fromHere('../index.html')
      console.log('[Neurodesk] Falling back to file://', indexFile)
      await overlay!.loadFile(indexFile)
    }
  })()

  overlay.webContents.on('did-finish-load', () => {
    console.log('[Neurodesk] overlay did-finish-load')
    overlay?.show(); overlay?.focus()
    if (DIAG) overlay?.webContents.openDevTools({ mode: 'detach' })
  })
  overlay.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[Neurodesk] did-fail-load', { code, desc, url })
  })
}

// ---- Global hotkey ----
function registerGlobalHotkey() {
  const combo = isMac ? 'CommandOrControl+Shift+K' : 'Control+Shift+K'
  const ok = globalShortcut.register(combo, () => {
    if (!overlay || overlay.isDestroyed()) createOverlayWindow()
    else overlay.isVisible() ? overlay.hide() : overlay.show()
    overlay?.focus()
    overlay?.webContents.send('overlay:focus-input')
  })
  if (!ok) console.error('[Neurodesk] Failed to register global hotkey')
}

// ---- IPC & backend proxy ----
function setupIPC() {
  ipcMain.on('overlay.close', () => overlay?.hide())

  ipcMain.on('commands.run', async (_evt, text: string) => {
    try { await proxyCommand(text) }
    catch (e) { console.error('[Neurodesk] commands.run error:', e) }
  })

  ipcMain.handle('commands.runInvoke', async (_evt, text: string) => {
    try { const res = await proxyCommand(text); return { ok: true, data: res } }
    catch (e: any) { return { ok: false, error: e?.message ?? String(e) } }
  })
}

async function proxyCommand(text: string) {
  const r = await fetch(`${BACKEND_URL}/commands/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!r.ok) {
    const body = await r.text().catch(() => '')
    throw new Error(`Backend error ${r.status}: ${body}`)
  }
  return r.json()
}

// ---- App lifecycle ----
app.whenReady().then(() => {
  // Leave Dock visible while debugging (re-enable hide later if you want)
  // if (isMac && !DIAG) app.dock.hide()
  createTray()
  createOverlayWindow()
  registerGlobalHotkey()
  setupIPC()
})

app.on('will-quit', () => globalShortcut.unregisterAll())
app.on('window-all-closed', (e: { preventDefault: () => any }) => e.preventDefault())
