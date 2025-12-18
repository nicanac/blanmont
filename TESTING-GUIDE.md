# Testing Google Photos Integration

## What Was Done

1. **Added `photoAlbumUrl` field** to the Trace interface
2. **Updated Notion integration** to extract Google Photos album URLs from the `photo` field
3. **Added photo album button** to trace detail pages
4. **Cleared .next cache** to ensure fresh compilation

## How to Test

### Step 1: Navigate to a Trace with Photos
Open your browser and go to:
```
http://localhost:3000/traces/534cd6e8-b74f-4c9d-9701-31e3d48692de
```

This is "Vers Tienen Landen #137" which has a Google Photos album.

### Step 2: Look for the Button
You should see:
- A "View Interactive Map" button (if the trace has a Komoot link)
- A blue "📸 View Photo Album" button below it
- A debug box showing the photoAlbumUrl value (in development mode)

### Step 3: Check the Console
Open the browser console (F12) and look for:
```
DEBUG - Trace: Vers Tienen Landen #137 photoAlbumUrl: https://photos.google.com/...
```

This confirms the data is being fetched correctly.

## Troubleshooting

If you don't see the button:

1. **Check the debug box** - It will show if photoAlbumUrl is empty or has a value
2. **Check the browser console** - Look for the DEBUG log
3. **Check the terminal** - Look for any compilation errors
4. **Try a hard refresh** - Ctrl+Shift+R or Cmd+Shift+R

## Traces with Google Photos

According to our inspection, these traces have Google Photos albums:
1. Vers Tienen Landen #137 (ID: 534cd6e8-b74f-4c9d-9701-31e3d48692de)
2. Meux cyclo #140

## Expected Behavior

- ✅ Blue button appears when photo album exists
- ✅ Button opens Google Photos in new tab
- ✅ Button styled with Google's blue (#4285f4)
- ✅ Camera emoji (📸) for easy identification
