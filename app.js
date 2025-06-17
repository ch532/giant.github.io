// API Keys - replace with your own valid keys
const OPENWEATHER_API_KEY = 'a65d564a892d82cd09d48a43888a1139';
const NEWSAPI_API_KEY = '38c80c8927e247a7878a2b3c28c0de00';

// HTML containers
const weatherContainer = document.getElementById('weather-container');
const generalNewsContainer = document.getElementById('general-news-container');
const sportsNewsContainer = document.getElementById('sports-news-container');

// Fetch weather for given cities (Nigerian cities)
async function fetchWeather(cities) {
  weatherContainer.innerHTML = ''; // Clear previous content
  for (const city of cities) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`);
      const data = await response.json();
      if (data.weather && data.main) {
        weatherContainer.innerHTML += `
          <p>
            <strong>${city}:</strong> ${capitalizeFirstLetter(data.weather[0].description)}, ${data.main.temp}°C
          </p>`;
      } else {
        weatherContainer.innerHTML += `<p><strong>${city}:</strong> Weather data not available.</p>`;
      }
    } catch (error) {
      weatherContainer.innerHTML += `<p><strong>${city}:</strong> Error fetching data.</p>`;
      console.error(error);
    }
  }
}

// Fetch general news headlines for Nigeria
async function fetchGeneralNews() {
  generalNewsContainer.innerHTML = 'Loading general news...';
  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=ng&category=general&apiKey=${NEWSAPI_API_KEY}`);
    const data = await response.json();
    displayNews(data.articles, generalNewsContainer, 'General News (Nigeria)');
  } catch (error) {
    generalNewsContainer.innerHTML = 'Failed to load general news.';
    console.error(error);
  }
}

// Fetch sports news headlines for Nigeria
async function fetchSportsNews() {
  sportsNewsContainer.innerHTML = 'Loading sports news...';
  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=ng&category=sports&apiKey=${NEWSAPI_API_KEY}`);
    const data = await response.json();
    displayNews(data.articles, sportsNewsContainer, 'Sports News (Nigeria)');
  } catch (error) {
    sportsNewsContainer.innerHTML = 'Failed to load sports news.';
    console.error(error);
  }
}

// Helper function to display news articles in container
function displayNews(articles, container, heading) {
  if (!articles || articles.length === 0) {
    container.innerHTML = `<h3>${heading}</h3><p>No news articles found.</p>`;
    return;
  }

  let html = `<h3>${heading}</h3><ul>`;
  articles.forEach(article => {
    const title = article.title || 'No title';
    const url = article.url || '#';
    html += `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;
  });
  html += '</ul>';

  container.innerHTML = html;
}

// Utility function to capitalize first letter of description
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Initialize all fetches
function initializeApp() {
  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano'];
  fetchWeather(cities);
  fetchGeneralNews();
  fetchSportsNews();
}

// Run when page loads
window.addEventListener('load', initializeApp);
