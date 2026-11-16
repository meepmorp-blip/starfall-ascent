# Save Protection

**Implemented locally (2026-11-16). Not deployed until the next approved push.**
- **Code:** `index.html`: the section headed "Save protection" (near `loadSave`), the `showBackup` screen, and the title-screen reminder.
- **Test:** `tools/save_protection_test.js` (32 checks, desk and phone).

## Where things are stored (all in this browser's `localStorage`, for this site only)
| Key | What |
|---|---|
| `starfall-ascent-save` | The save (unchanged format, `v:2`) |
| `starfall-ascent-save-snap-1`, `-snap-2`, `-snap-3` | Automatic backups, newest first: `{at, v, save}` |
| `starfall-ascent-save-prev` | The save that the last restore replaced (for **Undo restore**) |
| `starfall-ascent-save-broken-<time>` | An unreadable save, kept as found; only the newest two are kept |
| `starfall-ascent-prefs` → `lastBackupAt`, `firstPlayAt`, `backupSnooze` | Reminder bookkeeping |

**These keys sit in the same storage as the save.** They protect against a *damaged* or partly lost save, **not** against the browser clearing the whole site. Only a backup **file** or **code** kept outside the browser protects against that.

## Rolling automatic backups
- After every successful save, `snapshotSave()` copies the save into `-snap-1`, shifting the older ones down and dropping the oldest.
- It does this **at most once every 10 minutes**, and **at once** when you finish a story or quest or clear Chapter 1.
- It skips the copy if nothing changed.
- It never copies an invalid save (one with no `chars`, or from a newer save version).
- It never writes the main save key.
- If the storage is full, the backup quietly fails and the main save is unaffected.

## Recovery on load (`loadSave`)
- **The save can't be read:** it is kept as a `-broken-` copy, and the **newest valid automatic backup is loaded** and written back as the save. The title screen says which backup and when.
- **The save is missing but automatic backups exist:** nothing is loaded silently. The title screen says that backups were found, and the player can restore one from Builds → Backup.
- **No save and no backups:** a new game, as before.

## Persistent storage request
- At start, `requestPersistentStorage()` calls `navigator.storage.persisted()` / `persist()` when available. It never interrupts play.
- The result (granted, denied or unsupported) is only shown on the Backup screen, in plain words. **It is never presented as a guarantee.**

## Backup file
- **Builds → Backup → Download backup file** saves `starfall-backup-YYYY-MM-DD.json`. On a touch device that supports sharing files, it opens the share sheet instead (save to Files, AirDrop, mail).
- **Contents:** `{k:'sfa', format:'starfall-ascent-backup', v:1, saveV:2, at, save}`, which is the save plus version info and nothing else.
- The file is validated before it is made.
- **Backup codes** (`SFA1-…`) still work and now carry the same fields. Old codes from earlier builds are still accepted.

## Restore and undo
- **Ways to restore:** paste a code, choose a backup file, or press an automatic backup's button.
- **Before anything changes**, the backup is validated:
  - not a Starfall backup → refused
  - damaged (no characters) → refused
  - from a newer save version → refused with "update the game first"
- A confirmation says the progress will be replaced and that it can be undone.
- The current save is copied to `-prev` first. If that copy can't be written (storage full), **nothing changes** and the player is told to download a file first.
- **Undo restore** (shown while `-prev` exists) puts the earlier progress back and removes `-prev`.

## Reminder
- Shown **only on the title screen**: never in battles, story scenes or the city.
- It appears when the player has made real progress, has not backed up for **7 days** (or 7 days since they started on this device), and hasn't snoozed it.
- **Back up** opens the Backup screen. **Later** hides it for 3 days.
- Downloading a file or copying a code counts as a backup.

## Browser limits (honest version)
- Safari and iOS may clear a site's storage after long disuse or when the device needs space. Home-screen apps are treated more gently than Safari tabs, but nothing is guaranteed.
- The **home-screen app and Safari keep separate saves**. **Deleting the home-screen app deletes its save.**
- Private browsing keeps nothing after the tab closes.

## Manual iPhone backup (for players)
1. Open the game from the home screen, then **Builds → Backup → Download backup file**.
2. In the share sheet, choose **Save to Files** (or AirDrop or mail it to yourself).
3. **To restore:** Builds → Backup → under "Restore from a code or file", choose the file. If it's the wrong one, press **Undo restore**.
4. **Copy code** still works: paste it into Notes.

## Manual tests still needed on a real iPhone
- [ ] The share sheet appears for "Download backup file" in the home-screen app, and "Save to Files" produces a readable `.json`.
- [ ] Choosing that file in "Restore from a code or file" restores it; **Undo restore** reverts it.
- [ ] What the storage line says (granted, denied or unsupported) in Safari and in the home-screen app.
- [ ] The reminder appears after 7 days and stays hidden after "Later".
- [ ] After a long break, the game still opens with progress (or the backup file restores it).
