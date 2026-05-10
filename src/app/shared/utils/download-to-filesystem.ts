import { Capacitor } from '@capacitor/core';
import { FileTransfer } from '@capacitor/file-transfer';
import { Directory, Filesystem } from '@capacitor/filesystem';

export interface DownloadToFilesystemOptions {
    url: string;
    path: string;
    directory: Directory;
}

/**
 * Downloads `url` and persists it to the Capacitor Filesystem at `path` under
 * `directory`, in a way that round-trips correctly through `Filesystem.readFile`
 * on every platform.
 *
 * On native we use `@capacitor/file-transfer`, which streams via the platform
 * HTTP stack and bypasses WebView CORS.
 *
 * On web we deliberately bypass `FileTransfer.downloadFile`. Its web
 * implementation has two bugs that break this flow:
 *   1. It silently drops the `directory` option when delegating to
 *      `Filesystem.writeFile`, so the file is written at `/path` instead of
 *      `/<DIRECTORY>/path` and a subsequent `Filesystem.readFile({ directory })`
 *      misses with "File does not exist."
 *   2. If we work around (1) by passing the fully resolved URI as `path`, the
 *      plugin then tries to `Filesystem.mkdir` the depth-1 parent (e.g.
 *      `/DATA`), which the web `Filesystem` rejects with "Cannot create Root
 *      directory" — causing the write to fail and the plugin to fall back to
 *      a browser save-as dialog.
 * `Filesystem.writeFile` itself tolerates the missing depth-1 parent entry, so
 * fetching the blob ourselves and writing it directly is both simpler and
 * correct.
 */
export async function downloadToFilesystem(
    options: DownloadToFilesystemOptions
): Promise<void> {
    const { url, path, directory } = options;

    if (Capacitor.getPlatform() === 'web') {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} downloading ${url}`);
        }
        const blob = await response.blob();
        await Filesystem.writeFile({ path, directory, data: blob });
        return;
    }

    const { uri } = await Filesystem.getUri({ path, directory });
    await FileTransfer.downloadFile({ path: uri, url });
}
