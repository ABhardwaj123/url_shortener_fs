const normalizeUrl = (raw) => {
    if (typeof raw !== "string") return null

    let url = raw.trim()
    if (url.length === 0 || url.length > 2048) return null


    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url
    }

    try {
        const parsed = new URL(url)               // throws on "not a url"
        if (!parsed.hostname.includes(".")) return null   // rejects localhost and single-word hosts
        return parsed.href
    } catch {
        return null
    }
}

export default normalizeUrl