import { Link } from "../models/link.models.js";

const redirectToUrl = async (req, res) => {
    try {
        // the part of the URL after "/"
        const code = req.params.code

        // find the link that owns this short code
        const link = await Link.findOne({ shortCode: code })

        // no such code: stop here
        if (!link) {
            return res.status(404).json({ message: "link not found" })
        }

        // send the visitor to the original URL
        // 302 = temporary redirect, so browsers don't cache it and every visit hits our server
        res.redirect(302, link.url)

        // count the click AFTER the redirect is sent
        // a failure here is only logged, so it can never break the redirect
        try {
            await Link.updateOne({ _id: link._id }, { $inc: { accessCount: 1 } })
        } catch (err) {
            console.error(err)
        }
    } catch (err) {
    
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

export { redirectToUrl }