if (!getToken()) window.location.href = 'login.html'

const details = document.getElementById('details')
const errorMsg = document.getElementById('errorMsg')

// link.html?code=KRgz9rD  ->  "KRgz9rD"
const code = new URLSearchParams(window.location.search).get('code')

if (!code) window.location.href = 'dashboard.html'

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

async function loadLink() {
    try {
        const link = await apiRequest(`/api/links/${code}`)

        details.innerHTML = `
            <a href="${link.shortUrl}" target="_blank">${link.shortUrl}</a>
            <span>${escapeHtml(link.url)}</span>
            <span>${link.accessCount} clicks</span>
            <span>Created ${new Date(link.createdAt).toLocaleDateString()}</span>
            <button class="copy-btn" data-url="${link.shortUrl}">Copy</button>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `
    } catch (err) {
        // a non-owner or unknown code gets the 404 message from the backend
        errorMsg.textContent = err.message
    }
}

details.addEventListener('click', async (e) => {
    errorMsg.textContent = ''

    if (e.target.classList.contains('copy-btn')) {
        navigator.clipboard.writeText(e.target.dataset.url)
        e.target.textContent = 'Copied'
    }

    if (e.target.classList.contains('edit-btn')) {
        const newUrl = prompt('Enter the new destination URL:')
        if (!newUrl) return
        try {
            await apiRequest(`/api/links/${code}`, {
                method: 'PATCH',
                body: JSON.stringify({ url: newUrl })
            })
            loadLink()
        } catch (err) {
            errorMsg.textContent = err.message
        }
    }

    if (e.target.classList.contains('delete-btn')) {
        if (!confirm('Delete this link?')) return
        try {
            await apiRequest(`/api/links/${code}`, { method: 'DELETE' })
            window.location.href = 'dashboard.html'
        } catch (err) {
            errorMsg.textContent = err.message
        }
    }
})

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'dashboard.html'
})

loadLink()