export const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear();

    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

export const formatByteSize = (nBytes: number) => {
    return (
        nBytes < 2 ** 20 ?
            `${Math.floor(nBytes / 2 ** 10)} KB` :
            `${Math.floor(nBytes / 2 ** 20)} MB`
    );
}

export const hoursMinutesSeconds = (seconds: number) => {
    const _seconds = Math.floor(seconds) % 60;
    const minutes = Math.floor((seconds % 3600) / 60);
    const hours = Math.floor(seconds / 3600);
    return [hours, minutes, _seconds];
}

export const formatSecondsToTimer = (seconds: number) => {
    const parts = hoursMinutesSeconds(seconds);
    const paddedParts = parts.map(part => part.toString().padStart(2, "0"));
    return paddedParts.join(":");
}

export const formatSecondsToDuration = (seconds: number) => {
    const [hours, minutes, _seconds] = hoursMinutesSeconds(seconds);

    const parts = [];

    if (hours !== 0) {
        parts.push(`${hours}h`);
    }

    if (minutes !== 0) {
        parts.push(`${minutes}m`);
    }

    if (_seconds !== 0) {
        parts.push(`${_seconds}s`);
    }

    return parts.join(" ") || "-";
}