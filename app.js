// Your API keys
const openWeatherApiKey = 'a65d564a892d82cd09d48a43888a1139';
const newsApiKey = '38c80c8927e247a7878a2b3c28c0de00';
const newsDataApiKey = 'pub_030e9a25dd4542d58c4d9704b524014b';

// Containers from your HTML
const generalNewsContainer = document.getElementById('general-news-container');
const sportsNewsContainer = document.getElementById('sports-news-container');
const weatherContainer = document.getElementById('weather-container');
const newsDataContainer = document.getElementById('newsdata-news-container');

// Fetch and display weather for multiple Nigerian cities
async function fetchWeatherForCities(cities) {
  weatherContainer.innerHTML = ''; // Clear previous data
  for (const city of cities) {
    try {
      let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric`);
      let data = await response.json();
      if (data.weather) {
        weatherContainer.innerHTML += `<p><strong>${city}:</strong> ${data.weather[0].description}, ${data.main.temp}°C</p>`;
      } else {
        weatherContainer.innerHTML += `<p><strong>${city}:</strong> Weather data not available.</p>`;
      }
    } catch (e) {
      weatherContainer.innerHTML += `<p><strong>${city}:</strong> Error fetching data.</p>`;
      console.error(e);
    }
  }
}

// Fetch general news (NewsAPI example)
async function fetchGeneralNews() {
  try {
    let response = await fetch(`https://newsapi.org/v2/top-headlines?country=ng&category=general&apiKey=${newsApiKey}`);
    let data = await response.json();
    displayNews(data.articles, generalNewsContainer, 'General News (NewsAPI Nigeria)');
  } catch (error) {
    generalNewsContainer.innerHTML = 'Error loading general news.';
    console.error(error);
  }
}

// Fetch sports & entertainment news (NewsAPI example)
async function fetchSportsNews() {
  try {
    let response = await fetch(`https://newsapi.org/v2/top-headlines?country=ng&category=sports&apiKey=${newsApiKey}`);
    let data = await response.json();
    displayNews(data.articles, sportsNewsContainer, 'Sports & Entertainment News (NewsAPI Nigeria)');
  } catch (error) {
    sportsNewsContainer.innerHTML = 'Error loading sports news.';
    console.error(error);
  }
}

// Fetch news from NewsData.io
async function fetchNewsDataNews() {
  try {
    // Nigeria general news
    let urlNg = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&country=ng&category=general&page=1`;
    let responseNg = await fetch(urlNg);
    let dataNg = await responseNg.json();

    // World general news
    let urlWorld = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&category=general&page=1`;
    let responseWorld = await fetch(urlWorld);
    let dataWorld = await responseWorld.json();

    displayNews(dataNg.results, newsDataContainer, 'NewsData.io Nigeria News');
    displayNews(dataWorld.results, newsDataContainer, 'NewsData.io World News');
  } catch (error) {
    newsDataContainer.innerHTML = 'Error loading NewsData.io news.';
    console.error(error);
  }
}

// Helper function to render news articles
function displayNews(articles, container, heading) {
  if (!articles || articles.length === 0) {
    container.innerHTML += `<h3>${heading}</h3><p>No news found.</p>`;
    return;
  }

  let html = `<h3>${heading}</h3><ul>`;
  articles.forEach(article => {
    const title = article.title || article.name || 'No title';
    const url = article.link || article.url || '#';
    html += `<li><a href="${url}" target="_blank" rel="noopener">${title}</a></li>`;
  });
  html += '</ul>';

  container.innerHTML += html;
}

// Initialize everything
function initializeApp() {
  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano']; // Your cities for weather

  fetchWeatherForCities(cities);
  fetchGeneralNews();
  fetchSportsNews();
  fetchNewsDataNews();
}

// Run on page load
window.onload = initializeApp;
