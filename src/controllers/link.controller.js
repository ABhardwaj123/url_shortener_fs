import { Link } from "../models/link.models.js";
import { nanoid } from "nanoid";
import normalizeUrl from "../utils/normalizeUrl.js";
import { invalidateLink } from "../utils/cache.js"
import { Click } from "../models/click.models.js";

const createLink = async (req, res) => {
    try {
        const cleanUrl = normalizeUrl(req.body.url)
        if (!cleanUrl) {
            return res.status(400).json({ message: "please provide a valid url" })
        }

        // retry if the random code collides with an existing one
        for (let i = 0; i < 5; i++) {
            const shortCode = nanoid(7)

            try {
                const link = await Link.create({
                    userId: req.user.id,   // from the token, never from req.body
                    url: cleanUrl,
                    shortCode
                })

                return res.status(201).json({
                    id: link._id,
                    url: link.url,
                    shortCode: link.shortCode,
                    shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
                    accessCount: link.accessCount
                })
            } catch (err) {
                if(err.code !== 11000) throw err
            }
        }

        return res.status(500).json({ message: "could not generate a unique code" })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}


const formatLink = (link) => ({
    id: link._id,
    url: link.url,
    shortCode: link.shortCode,
    shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
    accessCount: link.accessCount,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt
})


const getMyLinks = async (req, res) => {
    try {
        // read ?page and ?limit from the URL, with safe defaults
        // page can't be below 1, limit can't be above 50
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = Math.min(parseInt(req.query.limit) || 10, 50)

        // how many links to skip to reach the requested page
        // page 1 skips 0, page 2 skips 10 (when limit is 10), and so on
        const skip = (page - 1) * limit

        // get only THIS user's links, newest first, one page at a time
        // req.user.id comes from the token, so users can never see each other's links
        const links = await Link.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        // total number of links this user has (used for "page 2 of 7" in the frontend)
        const total = await Link.countDocuments({ userId: req.user.id })

        // send back only the fields the dashboard needs
        return res.status(200).json({
            page,
            limit,
            total,
            links: links.map((link) => ({
                id: link._id,
                url: link.url,
                shortCode: link.shortCode,
                shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
                accessCount: link.accessCount,
                createdAt: link.createdAt
            }))
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}


const getLink = async (req, res) => {
    try {
        // filtering by userId too means other users' links look like "not found"
        const link = await Link.findOne({
            shortCode: req.params.code,
            userId: req.user.id
        })

        if (!link) {
            return res.status(404).json({ message: "link not found" })
        }

        return res.status(200).json(formatLink(link))
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}


const updateLink = async (req, res) => {
    try {
        const cleanUrl = normalizeUrl(req.body.url)
        if (!cleanUrl) {
            return res.status(400).json({ message: "please provide a valid url" })
        }

        // find (owner only) and update in one step
        //return document after update has been applied
        const link = await Link.findOneAndUpdate(
            { shortCode: req.params.code, userId: req.user.id },
            { url: cleanUrl },
            { returnDocument: "after" }
        )

        if (!link) {
            return res.status(404).json({ message: "link not found" })
        }

        await invalidateLink(req.params.code)

        return res.status(200).json(formatLink(link))
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}


const deleteLink = async (req, res) => {
    try {
        const link = await Link.findOneAndDelete({
            shortCode: req.params.code,
            userId: req.user.id
        })

        if (!link) {
            return res.status(404).json({ message: "link not found" })
        }

        await invalidateLink(req.params.code)

        return res.status(200).json({ message: "link deleted" })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}


const getAnalytics = async(req , res) => {

    try{
        const range = req.query.range === "30d" ? "30d" : "7d"
        const days = range === "30d" ? 30 : 7
        
        //en-CA is just a locale that prints the date in order
        const todayIST = new Date().toLocaleDateString("en-CA" , { timeZone: "Asia/Kolkata" })

        const startOfDay = new Date(`${todayIST}T00:00:00+05:30`)
        const since = new Date(startOfDay.getTime() - (days - 1) * 24 * 60 * 60 * 1000)

        const link = await Link.findOne({
            shortCode: req.params.code,
            userId: req.user.id
        })

        if (!link) {
            return res.status(404).json({ message: "link not found" })
        }

        const perDay = await Click.aggregate([
            //match the timestamps that in range
            { $match: { linkId: link._id , timestamp: { $gte: since }}},

            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$timestamp",
                            timezone: "Asia/Kolkata"
                        }
                    },

                    clicks: { $sum: 1}
                }
            },

            //oldest day first
            { $sort: {_id: 1}}
        ])

        // date -> count
        const counts = Object.fromEntries(perDay.map((day) => [day._id , day.clicks]))

        const clicksPerDay = []

        for(let i = 0; i < days ; i++){
            const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000)
                    .toLocaleDateString("en-CA" , { timeZone: "Asia/Kolkata" })
            
            clicksPerDay.push({date , clicks: counts[date] || 0})
        }

        const totalClicks = clicksPerDay.reduce((sum, day) => sum + day.clicks, 0)

        return res.status(200).json({ range, totalClicks, clicksPerDay })

    }catch(err){
        console.error(err)
        return res.status(500).json({ message: "Something went wrong" })
    }
}


export { createLink, getMyLinks, getLink, updateLink, deleteLink , getAnalytics}