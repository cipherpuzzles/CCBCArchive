export default function adjustTextColor(color: string) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    let brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 110 ? '#000000' : '#ffffff';
}