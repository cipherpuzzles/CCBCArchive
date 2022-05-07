export function formatTimestamp(timestamp: number){
    let date = new Date(timestamp);

    let Y = date.getFullYear().toString();

    let M = getTwoDigits(date.getMonth() + 1);

    let D = getTwoDigits(date.getDate());

    let h = getTwoDigits(date.getHours());

    let m = getTwoDigits(date.getMinutes());

    let s = getTwoDigits(date.getSeconds());

    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

function getTwoDigits(d: number){
    if(d < 10) return '0' + d;
    else return d.toString();
}
