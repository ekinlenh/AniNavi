const addToListBtn = document.getElementById("addToListBtn");

if (addToListBtn) {
  addToListBtn.addEventListener("click", async () => {

    // TODO: CHECK FOR USER's MEDIA LIST. IF THEY HAVE ANIME ALREADY ADDED, DISABLE BTN.

    const animeId = new URLSearchParams(window.location.search).get("id");
    if (!animeId) {
      alert("Anime ID not found in URL");
      return;
    }
    const animeTitle =
      document.querySelector(".anime-title")?.textContent || "Unknown Anime";
    const animeCover =
      document.querySelector(".cover-image")?.src || "imgs/media.png";
    const animeData = {
      mediaId: animeId,
      mediaTitle: animeTitle,
      mediaImage: animeCover.toString(),
    };

    const authToken = localStorage.getItem("authToken");

    const response = await fetch(
      "https://aninavi-server.onrender.com/api/users/me/uploadMedia",
      {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(animeData),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    }
  });
}

let animeData = {};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get("id");

    if (!animeId) {
      throw new Error("No anime ID found");
    }

    const pageContent = document.querySelector(".page-content");
    if (!pageContent) {
      throw new Error("Page content element not found");
    }

    const mediaResponse = await fetch(
      `https://api.jikan.moe/v4/anime/${animeId}/full`
    );
    const mediaCharactersResponse = await fetch(
      `https://api.jikan.moe/v4/anime/${animeId}/characters`
    );
    const mediaRecommendationsResponse = await fetch(
      `https://api.jikan.moe/v4/anime/${animeId}/recommendations`
    );
    const mediaVideosResponse = await fetch(
      `https://api.jikan.moe/v4/anime/${animeId}/videos`
    );

    if (!mediaResponse.ok) {
      throw new Error(`Failed to fetch data: ${mediaResponse.status}`);
    } else if (!mediaCharactersResponse.ok) {
      throw new Error(
        `Failed to fetch characters: ${mediaCharactersResponse.status}`
      );
    } else if (!mediaRecommendationsResponse.ok) {
      throw new Error(
        `Failed to fetch recommendations: ${mediaRecommendationsResponse.status}`
      );
    } else if (!mediaVideosResponse.ok) {
      throw new Error(`Failed to fetch videos: ${mediaVideosResponse.status}`);
    }

    // fetching media data, characters, and recommendations
    const mediaData = await mediaResponse.json();
    const mediaCharactersData = await mediaCharactersResponse.json();
    const mediaRecommendationsData = await mediaRecommendationsResponse.json();
    const mediaVideosData = await mediaVideosResponse.json();

    if (!mediaData.data) {
      throw new Error("No data received from API");
    } else if (!mediaCharactersData.data) {
      throw new Error("No characters data received from API");
    } else if (!mediaRecommendationsData.data) {
      throw new Error("No recommendations data received from API");
    } else if (!mediaVideosData.data) {
      throw new Error("No videos data received from API");
    }

    processAnimeData(
      mediaData.data,
      mediaCharactersData.data,
      mediaRecommendationsData.data,
      mediaVideosData.data
    );
    populateAnimeData(animeData);
    setupEventListeners();
  } catch (error) {
    console.error("Error:", error);
    showError(error.message);
  }
});

function processAnimeData(
  apiData,
  charactersData,
  recommendationsData,
  videosData
) {
  const genres = apiData.genres?.map((genre) => genre.name) || [];
  if (apiData.themes) {
    apiData.themes.forEach((theme) => genres.push(theme.name));
  }
  if (apiData.demographics) {
    apiData.demographics.forEach((demo) => genres.push(demo.name));
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Unknown"
      : `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  animeData = {
    id: apiData.mal_id || "Unknown",
    title: apiData.title_english || apiData.title || "Unknown Title",
    japaneseTitle: apiData.title || "",
    coverImage: apiData.images?.jpg?.large_image_url || "imgs/media.png",
    bannerImage:
      apiData.images?.jpg?.large_image_url || apiData.images?.jpg?.image_url,
    format: apiData.type || "Unknown",
    episodes: apiData.episodes || "Unknown",
    status: apiData.status || "Unknown",
    startDate: formatDate(apiData.aired?.from),
    endDate: formatDate(apiData.aired?.to),
    season: apiData.season ? `${apiData.season} ${apiData.year}` : "Unknown",
    source: apiData.source || "Unknown",
    genres: genres.length ? genres : ["Unknown"],
    duration: apiData.duration
      ? apiData.duration.replace(" per ep", "")
      : "Unknown",
    rating: apiData.rating ? apiData.rating.split(" - ")[0] : "Unknown",
    score: apiData.score || "N/A",
    rank: apiData.rank || "N/A",
    popularity: apiData.popularity || "N/A",
    members: apiData.members || "N/A",
    favorites: apiData.favorites || "N/A",
    synopsis: apiData.synopsis || "No synopsis available.",
    background: apiData.background || "",
    trailer: apiData.trailer?.url || null,
    studios:
      apiData.studios?.map((studio) => studio.name).join(", ") || "Unknown",
    characters: charactersData || [],
    recommendations: recommendationsData || [],
    relations: apiData.relations || [],
    videos: videosData.promo || [],
  };
}

function populateAnimeData(data) {
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text || "-";
  };

  // main info
  setText(".anime-title", data.title);
  setText(".title-japanese", data.japaneseTitle);

  // cover image
  const coverImage = document.querySelector(".cover-image");
  if (coverImage) {
    coverImage.src = data.coverImage;
    coverImage.alt = `${data.title} Cover`;
  }

  // info grid
  setText(".info-value.format", data.format);
  setText(".info-value.episodes", data.episodes);
  setText(".info-value.status", data.status);
  setText(".info-value.start-date", data.startDate);
  setText(
    ".info-value.season",
    data.season[0].toUpperCase() + data.season.slice(1)
  );
  setText(".info-value.source", data.source);
  setText(".info-value.genres", data.genres.join(", "));
  setText(".info-value.duration", data.duration);
  setText(".info-value.rating", data.rating);
  setText(".info-value.score", data.score);

  // description info
  setText(".description-text", data.synopsis);

  // stat info
  setText(
    ".stats-value.popularity",
    data.popularity ? `#${data.popularity}` : "N/A"
  );
  setText(".stats-value.rank", data.rank ? `#${data.rank}` : "N/A");
  setText(".stats-value.favorites", data.favorites?.toLocaleString() || "N/A");
  setText(".stats-value.members", data.members?.toLocaleString() || "N/A");

  // studio info
  if (data.studios) {
    const infoGrid = document.querySelector(".info-grid");
    if (infoGrid) {
      const studiosItem = document.createElement("div");
      studiosItem.className = "info-item";
      studiosItem.innerHTML = `
                <span class="info-label">Studios:</span>
                <span class="info-value studios">${data.studios}</span>
            `;
      infoGrid.appendChild(studiosItem);
    }
  }

  populateCharacters(data.characters);
  populateRecommendations(data.recommendations);
  populateRelations(data.relations);
  populateVideos(data.videos);
}

function populateCharacters(characters) {
  const charactersGrid = document.querySelector(".characters-grid");
  if (!charactersGrid) return;

  charactersGrid.innerHTML = "";

  const charactersToShow = characters.splice(0, 25);
  if (charactersToShow.length === 0) {
    charactersGrid.innerHTML = "<p>No character data available</p>";
    return;
  }

  charactersToShow.forEach((character) => {
    const characterCard = document.createElement("div");
    characterCard.className = "character-card";
    characterCard.innerHTML = `
            <img src="${character.character?.images?.jpg?.image_url}" 
                 alt="${character.character?.name || "Unknown"}" 
                 class="character-image"
                 onerror="this.src='imgs/media.png'">
            <div class="character-name">${
              character.character?.name || "Unknown"
            }</div>
            <div class="character-role">${character.role || "Unknown"}</div>
        `;
    charactersGrid.appendChild(characterCard);
  });
}

function populateRecommendations(recommendations) {
  const recommendationsGrid = document.querySelector(".recommendations-grid");
  if (!recommendationsGrid) return;

  recommendationsGrid.innerHTML = "";

  const recommendationsToShow = recommendations.splice(0, 25);
  if (!recommendationsToShow || recommendationsToShow.length === 0) {
    recommendationsGrid.innerHTML = "<p>No recommendations available</p>";
    return;
  }

  recommendationsToShow.forEach((rec) => {
    const recCard = document.createElement("div");
    recCard.className = "recommendations-card mediaCard";
    recCard.innerHTML = `
            <img src="${rec.entry?.images?.jpg?.image_url || "imgs/media.png"}" 
                 alt="${rec.entry?.title || "Unknown"}" 
                 class="recommendations-image mediaImage"
                 onerror="this.src='imgs/media.png'">
            <div class="recommendations-title mediaTitle">${
              rec.entry?.title || "Unknown"
            }</div>
        `;

    recCard.addEventListener("click", async () => {
      const mediaId = rec.entry?.mal_id;
      window.location.href = `mediaPage.html?id=${mediaId}`;
    });

    recommendationsGrid.appendChild(recCard);
  });
}

function populateRelations(relations) {
  const relationsContainer = document.querySelector(".relations-container");
  if (!relationsContainer) return;

  relationsContainer.innerHTML = "";

  if (!relations || relations.length === 0) {
    relationsContainer.innerHTML = "<p>No relation data available</p>";
    return;
  }

  relations.forEach((relation) => {
    relation.entry?.forEach((entry) => {
      const relationItem = document.createElement("div");
      relationItem.className = "relation-item";
      relationItem.innerHTML = `
                <div class="relation-type">${
                  relation.relation || "Unknown"
                }</div>
                <div class="relation-title">${entry.name || "Unknown"}</div>
            `;
      relationsContainer.appendChild(relationItem);
    });
  });
}

function populateVideos(videos) {
  const videosGrid = document.querySelector(".videos-grid");
  if (!videosGrid) return;

  videosGrid.innerHTML = "";

  const videosToShow = videos.splice(0, 3);
  if (!videosToShow || videosToShow.length === 0) {
    videosGrid.innerHTML = "<p>No videos available</p>";
    return;
  }

  videosToShow.forEach((vid) => {
    const vidCard = document.createElement("div");
    vidCard.className = "videos-card";
    vidCard.innerHTML = `
            <a href="${
              vid.trailer?.url || vid.trailer_url || "#"
            }" target="_blank" style="text-decoration:none;">
            <div class="videos-title" style="text-align:center;">${
              vid.title || "Unknown"
            }</div>
            <img 
                src="${
                  vid.trailer?.images?.maximum_image_url ||
                  vid.images?.maximum_image_url ||
                  "imgs/media.png"
                }" 
                alt="${vid.title || "Video Preview"}" 
                class="video-preview-image"
                style="width:100%;height:auto;display:block;object-fit:cover;"
                onerror="this.src='imgs/media.png'">
            </a>
        `;

    videosGrid.appendChild(vidCard);
  });
}

function setupEventListeners() {
  // add to list function

  const trailerBtn = document.querySelector(".trailer-btn");
  if (trailerBtn) {
    if (animeData?.trailer) {
      trailerBtn.addEventListener("click", function () {
        window.open(animeData.trailer, "_blank");
      });
    } else {
      trailerBtn.disabled = true;
      trailerBtn.textContent = "No Trailer";
      trailerBtn.style.opacity = "0.6";
    }
  }
}

function showError(message) {
  const pageContent = document.querySelector(".page-content");
  if (!pageContent) return;

  const errorEl = document.createElement("div");
  errorEl.className = "error";
  errorEl.innerHTML = `
        <h2>Error Loading Anime Details</h2>
        <p>${message}</p>
        <button id="retry-btn">Try Again</button>
    `;
  pageContent.innerHTML = "";
  pageContent.appendChild(errorEl);
  document
    .getElementById("retry-btn")
    ?.addEventListener("click", () => window.location.reload());
}
