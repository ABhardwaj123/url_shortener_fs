// this is frontend's communication layer with backend
const API = "http://localhost:3000"

//localStorage is a browser API and it persists even after a page is loaded

function saveToken(token){
    localStorage.setItem('token', token)
}

function getToken(){
    return localStorage.getItem('token')
}

function removeToken(){
    localStorage.removeItem('token')
}

//apiRequest wrapper
async function apiRequest(endpoint , options = {}) {
    //using options = {}, things like {method: 'POST' , body: ...} can be passed
    const token = getToken()

    const headers = {
        //this tells the server that request body contains JSON data
        'Content-Type': 'application/json',

        //spreads any extra headers if passed
        ...options.headers
    }

    if(token){
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API}${endpoint}` , {

        //spread operator
        ...options,
        headers
    })

    if (response.status === 401 && !endpoint.startsWith('/api/auth')) {
        removeToken()
        window.location.href = 'login.html'
        return
    }

    const data = await response.json()

    if(!response.ok){
        throw new Error(data.message || 'Something went wrong')
    }

    return data

}

