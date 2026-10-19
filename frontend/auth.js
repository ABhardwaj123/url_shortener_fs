const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const errorMsg = document.getElementById('errorMsg')

if(loginForm){

    //event represents the form submission even
    loginForm.addEventListener('submit' , async(event) => {
        
        //helps us to handle submission through JS rather than browser performing its natural submission behaviour
        //we handle by sending data to backend etc
        event.preventDefault()

        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        try{
            const data = await apiRequest('/api/auth/login' , {
                method: 'POST',
                body: JSON.stringify({ email , password})
            })

            saveToken(data.token)
            window.location.href = 'dashboard.html'
        }
        catch(err){
            errorMsg.textContent = err.message
        }
    })
}

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        try {
            await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })

            window.location.href = 'login.html'
        } catch (err) {
            errorMsg.textContent = err.message
        }
    })

}