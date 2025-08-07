document.addEventListener("DOMContentLoaded", () => {
  const browseBtn = document.getElementById("browseBtn");
  const profileBtn = document.getElementById("profileBtn");

  const headerRightSection = document.querySelector(".right");

  checkIfUserIsLoggedIn();

  browseBtn.onclick = () => {
    window.location.href = "../browse.html";
  };

  profileBtn.onclick = () => {
    window.location.href = "../html/profile.html";
  };

  async function checkIfUserIsLoggedIn() {
    
    try {  
      const response = await fetch("http://localhost:8080/api/users/validated", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

      if (response.ok) {
        await showAuthenticatedUI();
      } else {
        showGuestUI();
      }


    } catch(error) {
      console.error("Authentication check failed: ", error);
    }
  }

  async function showAuthenticatedUI() {
    try {
      const token = localStorage.getItem("authToken");
      
      const profileResponse = await fetch("http://localhost:8080/api/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        showUserUI(profileData.username);
      }

    } catch (error) {
      console.error("Failed to load authenticated user's profile: ", error);
      showGuestUI();
    }
  }

  function showUserUI(username) {
    while (headerRightSection.firstChild) {
      headerRightSection.removeChild(headerRightSection.firstChild);
    }

    headerRightSection.innerHTML = '';

    const userBtn = document.createElement("button");
    userBtn.innerHTML = username; 
    userBtn.classList.add("headerBtn");
    userBtn.id = "profileBtn";
    userBtn.addEventListener("click", () => {
      window.location.href = "../html/profile.html";
    });

    headerRightSection.appendChild(userBtn);

    profileBtn.classList.remove("hide");
  }

  function showGuestUI() {
    headerRightSection.innerHTML = '';

    const loginBtn = document.createElement("button");
    loginBtn.classList.add("accountBtn");
    loginBtn.id = "loginBtn";
    loginBtn.textContent = "Log In";
    loginBtn.addEventListener("click", () => {
      window.location.href = "../html/login.html";
    });

    const signUpBtn = document.createElement("button");
    signUpBtn.classList.add("accountBtn");
    signUpBtn.id = "signUpBtn";
    signUpBtn.textContent = "Sign Up";
    signUpBtn.addEventListener("click", () => {
      window.location.href = "../html/signup.html";
    });

    headerRightSection.appendChild(loginBtn);
    headerRightSection.appendChild(signUpBtn);

    profileBtn.classList.add("hide");
  }

});
