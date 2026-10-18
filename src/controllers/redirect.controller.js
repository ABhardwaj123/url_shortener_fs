import { Link } from "../models/link.models.js";
import { Click } from "../models/click.models.js";
import { getCachedLink, setCachedLink } from "../utils/cache.js";


const recordClick = async (linkId) => {
    try{
        await Click.create({ linkId })
    }catch(err){
        console.error(err)
    }
}


const redirectToUrl = async (req, res) => {
    try {
        // the part of the URL after "/"
        const code = req.params.code

        let url , linkId
        //getting cached object
        const cached = await getCachedLink(code)

        if(cached){
            url = cached.url
            linkId = cached.linkId
            res.set("X-Cache" , "HIT")
        }else{
            // find the link that owns this short code
            const link = await Link.findOne({ shortCode: code })

            // no such code: stop here
            if (!link) {
                return res.status(404).json({ message: "link not found" })
            }
            url = link.url
            linkId = link._id
            res.set("X-Cache", "MISS")
        }

        // send the visitor to the original URL
        // 302 = temporary redirect, so browsers don't cache it and every visit hits our server
        res.redirect(302, url)

        // store in the cache AFTER the visitor already has the response
        if (!cached) await setCachedLink(code, { url, linkId })

        await recordClick(linkId)

        // count the click AFTER the redirect is sent
        // a failure here is only logged, so it can never break the redirect
        try {
            await Link.updateOne({ _id: linkId }, { $inc: { accessCount: 1 } })
        } catch (err) {
            console.error(err)
        }
    } catch (err) {
    
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}

export { redirectToUrl }