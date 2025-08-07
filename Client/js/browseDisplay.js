// HTML elements 
const viewAllButtons = document.querySelectorAll("#viewAll");
const prevButtons = document.querySelectorAll("#prev");
const nextButtons = document.querySelectorAll("#next");

const displayContainer = document.querySelector(".displayContainer")
const airingList = document.getElementById("airing");
const upcomingList = document.getElementById("upcoming");
const popularList = document.getElementById("popular");
const searchInput = document.querySelector("[data-search]");

// search feature variables
let searchContainer = null;
let currentPage = 1;
let isLoading = false;
let lastSearchValue = "";
let hasMoreResults = true;

// sort boxes
let sortAiringStatus = "any";
let sortSeason = "any";
let sortFormat = "any";
let sortYear = "any";

let sortOptions = {
  searchValue: false,
  statusValue: false,
  yearValue: false,
  seasonValue: false,
  formatValue: false
};

// TODO: implement logic for button scrolling
let isScrolling;

prevButtons.forEach(prevButton => {
    prevButton.onclick = function() {
        prevButton.parentElement.scrollLeft -= 50;
    }
})

nextButtons.forEach(nextButton => {
    nextButton.onclick = function() {
        nextButton.parentElement.scrollLeft += 50;
    }
})

// set up
setUpYearSorting();

// fetch different categories for browse page
if (airingList) {
fetchAiringMediaData();
} 
if (upcomingList) {
fetchNextSeasonMediaData();
}
if (popularList) {
  fetchPopularMediaData();
}

// search bar input
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const value = e.target.value.toLowerCase();
  if (value === "") {
    sortOptions.searchValue = false;
    searchContainer.remove();
    lastSearchValue = "";
  } else {
    sortOptions.searchValue = true;
  }

  searchTimeout = setTimeout(() => {
      searchMedia(value, sortAiringStatus, sortYear, sortSeason, sortFormat, 1);
  }, 500);

});

// search bar function 
async function searchMedia(value, airingStatus, year, season, format, page) {

  // debug purposes
  console.log(value, sortAiringStatus, sortYear, sortSeason, sortFormat, page);
  console.log(sortOptions);

  try {
    displayContainer.classList.toggle("hide", sortOptions.searchValue || sortOptions.statusValue 
      || sortOptions.yearValue || sortOptions.seasonValue || sortOptions.formatValue);

    if (!sortOptions.searchValue && !sortOptions.statusValue 
      && !sortOptions.yearValue && !sortOptions.seasonValue && !sortOptions.formatValue) {
        searchContainer.remove();
        return;
    }

    // if is a new search, reset all configs
    if (page === 1) {
      if (searchContainer) {
        searchContainer.remove();
      }
      searchContainer = document.createElement("div");
      searchContainer.classList.add("searchResultsContainer");
      document.body.appendChild(searchContainer)
      
      currentPage = 1;
      hasMoreResults = true;
      lastSearchValue = value;
    }

    isLoading = true;

    // fetches search result
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("order_by", "popularity");
    params.append("sfw", "true");
    if (value !== "") params.append("q", value);
    if (airingStatus !== "any") params.append("status", airingStatus);
    if (format !== "any") params.append("type", format);
    
    if (season !== "any" && year !== "any") {
      const {start, end} = getSeasonDates(season.toLowerCase(), year);
      params.append("start_date", start);
      params.append("end_date", end);
    } else if (year !== "any") {
      params.append("start_date", `${year}-01-01`);
      params.append("end_date", `${year}-12-31`);
    }

    const queryString = params.toString();

    const mediaList = await fetchMedia(`https://api.jikan.moe/v4/anime?${queryString}`);
    
    if (mediaList.data && mediaList.data.length > 0) {
      displayMedia(mediaList.data, searchContainer);
      if (!mediaList.pagination || !mediaList.pagination.has_next_page) {
        hasMoreResults = false;
      } else {
        currentPage++;
      }
    } else {
      hasMoreResults = false;
      if (page === 1) {
        const noResults = document.createElement("p");
        noResults.textContent = "No results.";
        searchContainer.appendChild(noResults);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading = false;
  }
}

window.addEventListener("scroll", async () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 500;

    if (nearBottom && !isLoading && hasMoreResults && displayContainer.classList.contains("hide")) {
      await searchMedia(lastSearchValue, sortAiringStatus, sortYear, sortSeason, sortFormat, currentPage); 
    }
  }
);

// search header dropdown menu (airing status, season, format) 
document.addEventListener('DOMContentLoaded', function() {
  const dropdowns = document.querySelectorAll('.dropdown');
  let yearDropdown;

  dropdowns.forEach(dropdown => {
    const header = dropdown.querySelector('.dropdownHeader');
    const selectedValue = dropdown.querySelector('.selectedValue');
    const options = dropdown.querySelectorAll('.dropdownOptions li');

    if (options[0].parentElement.classList.contains("yearSort")) {
      yearDropdown = selectedValue;
    }

    header.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    options.forEach(option => {
      option.addEventListener('click', async() => {
        selectedValue.textContent = option.textContent;
        dropdown.classList.remove('active');

        const dropdownType = dropdown.getAttribute("data-value");
        switch (dropdownType) {
          case "airingStatus":
            sortAiringStatus = selectedValue.textContent.toLowerCase();
            sortOptions.statusValue = (sortAiringStatus !== "any") ? true : false;
            break;
          case "year":
            sortYear = selectedValue.textContent.toLowerCase();
            sortOptions.yearValue = (sortYear !== "any") ? true : false;
            break;
          case "season":
            sortSeason = selectedValue.textContent.toLowerCase();
            sortOptions.seasonValue = (sortSeason !== "any") ? true : false;
              if (yearDropdown.textContent !== sortYear) {
                sortYear = (new Date().getFullYear()).toString();
                yearDropdown.textContent = sortYear;
                sortOptions.yearValue = true;
              }
            break;
          case "format":
            sortFormat = selectedValue.textContent.toLowerCase();
            sortOptions.formatValue = (sortFormat !== "any") ? true : false;
            break;
        }
        
        await searchMedia(lastSearchValue, sortAiringStatus, sortYear, sortSeason, sortFormat, 1);
      });
    });
    })
});

// api call to get media data, sorted by currently airing and popularity
async function fetchAiringMediaData() {

  try {
    const mediaList = await fetchMedia("https://api.jikan.moe/v4/anime?status=airing&order_by=popularity&sort=asc&sfw=true");
    displayMedia(mediaList.data, airingList);

  } catch (error) {
    console.error(error); 
  }
}

// airing viewAll button 
viewAllButtons[0].addEventListener("click", () => {
    clearFilters();

    sortAiringStatus = "airing";
    sortOptions.statusValue = true;
    searchMedia(lastSearchValue, sortAiringStatus, sortYear, sortSeason, sortFormat, 1);
})

// api call to get media data, sorted by upcoming anime and popularity
async function fetchNextSeasonMediaData() {

  try {
    const {nextSeason, nextYear} = getNextSeason();
    const mediaList = await fetchMedia(`https://api.jikan.moe/v4/seasons/${nextYear}/${nextSeason}?sfw=true`);
    displayMedia(mediaList.data, upcomingList);

  } catch (error) {
    console.error(error); 
  }
}

// next season viewAll button 
viewAllButtons[1].addEventListener("click", () => {
    clearFilters();

    const {nextSeason, nextYear} = getNextSeason();
    sortSeason = nextSeason.toLowerCase();
    sortYear = nextYear.toString();
    sortOptions.seasonValue = true;
    sortOptions.yearValue = true;
    searchMedia(lastSearchValue, sortAiringStatus, sortYear, sortSeason, sortFormat, 1);
})

// api call to get media data, sorted by popularity
async function fetchPopularMediaData() {

  try {
    const mediaList = await fetchMedia("https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&sfw=true");
    displayMedia(mediaList.data, popularList);

  } catch (error) {
    console.error(error); 
  }
}

// popular viewAll button 
viewAllButtons[2].addEventListener("click", () => {
    sortOptions.formatValue = true;
    searchMedia(lastSearchValue, sortAiringStatus, sortYear, sortSeason, sortFormat, 1);
})

// accepts media list and creates the media item for screen display
function displayMedia(mediaList, categoryList) {

  const seenMediaIds = new Set();

  mediaList.forEach((media, index) => {
    
    // check for accidental duplicate media called from api
    if (seenMediaIds.has(media.mal_id)) {
      return;
    }
    seenMediaIds.add(media.mal_id);

    const mediaCard = document.createElement("div");
    mediaCard.classList.add("mediaCard");

    const mediaImage = document.createElement("img");
    mediaImage.src = media.images?.jpg?.large_image_url || "imgs/media.png";
    mediaImage.alt = media.title_english || media.title || `Anime ${index + 1}`;
    mediaImage.loading = "lazy";
    mediaImage.classList.add("mediaImage");

    const mediaTitle = document.createElement("p");
    mediaTitle.textContent = media.title_english || media.title;
    mediaTitle.classList.add("mediaTitle");

    mediaCard.appendChild(mediaImage);
    mediaCard.appendChild(mediaTitle);

    mediaCard.addEventListener("click", async () => {
      const mediaId = media.mal_id;
      window.location.href = `../html/mediaPage.html?id=${mediaId}`;
    });

    categoryList.appendChild(mediaCard);

  })
}


async function fetchMedia(apiLink) {
  try {
    const response = await fetch(apiLink);

    if (!response.ok) {
      throw new Error("Could not fetch response.");
    }

    const mediaList = await response.json();
    return mediaList;

  } catch (error) {
    console.error(error); 
  }
}

function setUpYearSorting() {
  const yearSort = document.querySelector(".yearSort");
  let year = new Date().getFullYear();

  if (yearSort !== null) {
    while (year >= 1940) {
      const listElement = document.createElement("li");
      listElement.setAttribute("data-value", year);
      listElement.textContent = year;
      yearSort.appendChild(listElement);
      year--;
    }
  }
}

// gets season dates for filtering
function getSeasonDates(season, year) {
  const seasons = {
    winter: { start: `${year}-01-01`, end: `${year}-03-31` },
    spring: { start: `${year}-04-01`, end: `${year}-06-30` },
    summer: { start: `${year}-07-01`, end: `${year}-09-30` },
    fall: { start: `${year}-10-01`, end: `${year}-12-31` },
  };
  return seasons[season.toLowerCase()] || seasons.winter;
}

// determines the next season depending on current date (for upcoming media)
function getNextSeason() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let nextSeason, nextYear;

  if (currentMonth <= 2) { // Jan-Feb -> Next season: Spring 
    nextSeason = "spring";
    nextYear = currentYear;
  } else if (currentMonth <= 5) { // Mar-May -> Next season: Summer 
    nextSeason = "summer";
    nextYear = currentYear;
  } else if (currentMonth <= 8) { // Jun-Aug -> Next season: Fall
    nextSeason = "fall";
    nextYear = currentYear;
  } else if (currentMonth <= 11) { //Sep-Nov -> Next season: Winter
    nextSeason = "winter";
    nextYear = currentYear + 1;
  } else { // next season: Spring
    nextSeason = "spring";
    nextYear = currentYear + 1;
  }

  return {nextSeason, nextYear};
}

function clearFilters() {
    lastSearchValue = "";
    sortAiringStatus = "any";
    sortYear = "any";
    sortSeason = "any";
    sortFormat = "any";

    sortOptions.searchValue = false;
    sortOptions.statusValue = false;
    sortOptions.yearValue = false;
    sortOptions.seasonValue = false;
    sortOptions.formatValue = false;
}