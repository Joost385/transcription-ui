export const downloadFromUrl = (url: string, filename: string = "") => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

export const downloadBlob = (blob: Blob, filename: string = "") => {
    const url = URL.createObjectURL(blob);
    downloadFromUrl(url, filename);
    URL.revokeObjectURL(url);
}