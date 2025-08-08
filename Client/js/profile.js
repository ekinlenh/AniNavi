const profilePopup = document.getElementById("profilePopup");
const profilePictureUpload = document.getElementById("profilePictureUpload");
const profilePreview = document.getElementById("profilePreview");
const previewContainer = document.querySelector(".preview-container");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const saveBtn = document.querySelector(".saveBtn");

let profileImageDataURL = null;
let hasCustomImage = false;
const defaultImageSrc = "../imgs/profile.png";

function openPopup() {
  profilePopup.classList.add("active");
}

function closePopup() {
  profilePopup.classList.remove("active");
}

document.addEventListener("click", function (event) {
  const popup = document.getElementById("profilePopup");
  if (event.target === popup) {
    closePopup();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserData();
});

profilePictureUpload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      profileImageDataURL = event.target.result;
      profilePreview.src = profileImageDataURL;
      hasCustomImage = true;
      updateRemoveButtonVisibility();
    };
    reader.readAsDataURL(file);
  }
});

function removePhoto() {
  profilePreview.src = defaultImageSrc;
  profileImageDataURL = null;
  hasCustomImage = false;

  profilePictureUpload.value = "";

  updateRemoveButtonVisibility();
}

function updateRemoveButtonVisibility() {
  if (hasCustomImage) {
    previewContainer.classList.add("has-custom-image");
  } else {
    previewContainer.classList.remove("has-custom-image");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateRemoveButtonVisibility();
});

saveBtn.addEventListener("click", async () => {
  closePopup();
  await saveProfileData();
});

async function loadUserData() {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `application/json`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      displayUserInfo(user);

      // display edit profile information
      document.getElementById("username").value = user.username;
      document.getElementById("email").value = user.email;
      document.getElementById("password").value = "";
      document.getElementById("profileDescription").value =
        user.profileDescription;

      if (user.profileImage != null) {
        profilePreview.src = user.profileImage;
      }
      return user;
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}

function displayUserInfo(user) {
  document.getElementById("profileName").innerHTML = user.username;
  document.getElementById("profileBio").innerHTML =
    user.profileDescription != null ? user.profileDescription : "About Me";

  loadWatchlist(user.mediaList);
}

async function saveProfileData() {
  const formData = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    description: document.getElementById("profileDescription").value,
    password: document.getElementById("password").value,
    profileImage: profilePreview.src,
  };

  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      "/api/users/me/uploadInfo",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      // update stored token
      const data = await response.json();
      localStorage.setItem("authToken", data.token);

      // update user state
      await loadUserData();
      closePopup();
    } else {
      throw new Error(`HTTP Error: Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error: ", error);
    alert("An error occurred while saving the profile");
  }
}

function loadWatchlist(mediaList) {
  const watchlistContainer = document.getElementById("watchlistContainer");

  watchlistContainer.innerHTML = "";

  if (mediaList.length === 0) {
    watchlistContainer.innerHTML = "<p>Your watchlist is empty.</p>";
    return;
  }

  mediaList.forEach((anime) => {
    const itemContainer = document.createElement("div");
    itemContainer.className = "watchlist-item-container";

    const watchlistItem = document.createElement("div");
    watchlistItem.className = "watchlist-item mediaCard";
    watchlistItem.innerHTML = `
            <img class="mediaImage" src="${anime.mediaImage}" alt="${anime.mediaTitle}">
            <div class="watchlistTitle mediaTitle">${anime.mediaTitle}</div>
        `;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "X";
    removeBtn.setAttribute("data-id", anime.mediaId);

    itemContainer.appendChild(watchlistItem);
    itemContainer.appendChild(removeBtn);

    watchlistItem.addEventListener("click", async () => {
      const mediaId = watchlistContainer.entry?.mal_id;
      window.location.href = `../html/mediaPage.html?id=${mediaId}`;
    });

    watchlistContainer.appendChild(itemContainer);
  });

  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", async(e) => {
      const animeId = e.target.getAttribute("data-id");
      await removeFromWatchlist(animeId);
    });
  });
}

async function removeFromWatchlist(animeId) {

  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(
      "http://localhost:8080/api/users/me/removeMedia",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(animeId),
      }
    );

    if (response.ok) {
      // update stored token
      const data = await response.json();
      console.log(data);

      // update user state
      await loadUserData();
    } else {
      throw new Error(`HTTP Error: Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error: ", error);
    alert("An error occurred while removing media from watchlist.");
  }
}

async function logout() {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      localStorage.removeItem("authToken");
      window.location.href = "../html/login.html";
    } else {
      throw new Error(`Logout failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Logout error: ", error);
  }
}
