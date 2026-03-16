export const prizeTranslate: Record<string, string> = {
    "รางวัลที่ 1": "First Prize",
    "รางวัลข้างเคียงรางวัลที่ 1": "First Prize Neighbors",
    "รางวัลที่ 2": "Second Prize",
    "รางวัลที่ 3": "Third Prize",
    "รางวัลที่ 4": "Fourth Prize",
    "รางวัลที่ 5": "Fifth Prize",
}

export const runningTranslate: Record<string, string> = {
    "รางวัลเลขหน้า 3 ตัว": "Front 3 Digits",
    "รางวัลเลขท้าย 3 ตัว": "Back 3 Digits",
    "รางวัลเลขท้าย 2 ตัว": "Back 2 Digits",
}


export function convertThaiDate(date: string) {
    const months: any = {
        "มกราคม": "January",
        "กุมภาพันธ์": "February",
        "มีนาคม": "March",
        "เมษายน": "April",
        "พฤษภาคม": "May",
        "มิถุนายน": "June",
        "กรกฎาคม": "July",
        "สิงหาคม": "August",
        "กันยายน": "September",
        "ตุลาคม": "October",
        "พฤศจิกายน": "November",
        "ธันวาคม": "December",
    }

    const parts = date.split(" ")

    const day = parts[0]
    const month = months[parts[1]]
    const year = Number(parts[2]) - 543

    return `${day} ${month} ${year}`
}
export function translateLottoName(name: string) {
    return prizeTranslate[name] || runningTranslate[name] || name
  }