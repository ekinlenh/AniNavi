const signUpForm = document.getElementById("signUpForm");
const loginForm = document.getElementById("loginForm");
const pageContent = document.querySelector(".page-content");

if (signUpForm) {
    signUpForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        
        try {
            // grabbing user information 
            const formData = {
                username: document.getElementById("username").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            };

            console.log(formData);

            // add loading screen while creating account
            const loader = document.createElement("div");
            loader.className = "loader";

            while (pageContent.firstChild) {
                pageContent.removeChild(pageContent.firstChild);
            }

            pageContent.appendChild(loader);


            // creating account for user
            const res = await fetch("https://aninavi-server.onrender.com/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                console.log(data);

                sessionStorage.setItem("emailForVerification", data.email);

                setTimeout(() => {
                    window.location.href = `../html/verify-email.html`;
                }, 1500);
                
            } else {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = "Sign up failed. Try again.";
                messageDiv.style.cssText = `
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                    font-weight: bold;
                    color: #721c24
                `

                loginForm.appendChild(messageDiv);

                setTimeout(() => {
                    messageDiv.remove();
                }, 5000);
            }

        } catch (error) {
            console.error("Error: ", error);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async(e) => {
    try {
        e.preventDefault();

        const formData = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        console.log(formData);

        const res = await fetch("https://aninavi-server.onrender.com/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            const data = await res.json();

            console.log(data);
            localStorage.setItem("authToken", data.token);

            window.location.href = `../html/profile.html`;
        } else {
            const messageDiv = document.createElement("div");
            messageDiv.textContent = "Incorrect email or password. Try again.";
            messageDiv.style.cssText = `
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
                font-weight: bold;
                color: #721c24
            `

            loginForm.appendChild(messageDiv);

            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }

    } catch (error) {
        console.error("Error: ", error);
    }})
}