// no token means no dashboard
if (!getToken()) window.location.href = 'login.html'

const linkList = document.getElementById('linkList')
const errorMsg = document.getElementById('errorMsg')
const pageInfo = document.getElementById('pageInfo')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')

let page = 1
const limit = 10

//used to escape HTML special characters so that a string is treated as a text rather than HTML markup
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

async function loadLinks() {
    try {
        const data = await apiRequest(`/api/links?page=${page}&limit=${limit}`)

        const totalPages = Math.max(Math.ceil(data.total / limit), 1)

        // deleted the last link on a page: step back one page
        if (page > totalPages) {
            page = totalPages
            return loadLinks()
        }

        if (data.links.length === 0) {
            linkList.innerHTML = '<p>No links yet.</p>'
        } else {
            linkList.innerHTML = data.links.map(link => `
                <div class="row">
                    <a href="${link.shortUrl}" target="_blank">${link.shortUrl}</a>
                    <span>${escapeHtml(link.url)}</span>
                    <span>${link.accessCount} clicks</span>
                    <span>${new Date(link.createdAt).toLocaleDateString()}</span>
                    <button class="details-btn" data-code="${link.shortCode}">Details</button>
                    <button class="copy-btn" data-url="${link.shortUrl}">Copy</button>
                    <button class="edit-btn" data-code="${link.shortCode}">Edit</button>
                    <button class="delete-btn" data-code="${link.shortCode}">Delete</button>
                </div>
            `).join('')
        }

        pageInfo.textContent = `Page ${page} of ${totalPages}`
        prevBtn.disabled = page <= 1
        nextBtn.disabled = page >= totalPages
    } catch (err) {
        errorMsg.textContent = err.message
    }
}

// create a link
document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    errorMsg.textContent = ''

    const urlInput = document.getElementById('urlInput')

    try {
        await apiRequest('/api/links', {
            method: 'POST',
            body: JSON.stringify({ url: urlInput.value })
        })
        urlInput.value = ''

        //takes you to the latest page where new link just got added
        page = 1
        loadLinks()
    } catch (err) {
        errorMsg.textContent = err.message
    }
})

// one listener handles every Details / Copy / Edit / Delete button
linkList.addEventListener('click', async (e) => {
    errorMsg.textContent = ''

    if (e.target.classList.contains('details-btn')) {
        window.location.href = `link.html?code=${e.target.dataset.code}`
    }

    if (e.target.classList.contains('copy-btn')) {
        navigator.clipboard.writeText(e.target.dataset.url)
        e.target.textContent = 'Copied'
    }

    if (e.target.classList.contains('edit-btn')) {
        const newUrl = prompt('Enter the new destination URL:')
        if (!newUrl) return
        try {
            await apiRequest(`/api/links/${e.target.dataset.code}`, {
                method: 'PATCH',
                body: JSON.stringify({ url: newUrl })
            })
            loadLinks()
        } catch (err) {
            errorMsg.textContent = err.message
        }
    }

    if (e.target.classList.contains('delete-btn')) {
        if (!confirm('Delete this link?')) return
        try {
            await apiRequest(`/api/links/${e.target.dataset.code}`, { method: 'DELETE' })
            loadLinks()
        } catch (err) {
            errorMsg.textContent = err.message
        }
    }
})

prevBtn.addEventListener('click', () => { page--; loadLinks() })
nextBtn.addEventListener('click', () => { page++; loadLinks() })

document.getElementById('logoutBtn').addEventListener('click', () => {
    removeToken()
    window.location.href = 'login.html'
})

loadLinks()