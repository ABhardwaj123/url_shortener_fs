const normalizeUrl = (raw) => {
    //pasted url must be string
    if (typeof raw !== "string") return null

    //removing whitespaces from start and end
    let url = raw.trim()
    if (url.length === 0 || url.length > 2048) return null


    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url
    }

    try {
        //parsed is an url objest
        const parsed = new URL(url)               
        if (!parsed.hostname.includes(".")) return null 

        //parsed.href looks something like: https://www.google.com/
        return parsed.href
    } catch {
        return null
    }
}

export default normalizeUrl