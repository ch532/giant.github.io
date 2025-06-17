// Your API keys here
const OPENWEATHER_API_KEY = 'a65d564a892d82cd09d48a43888a1139';
const NEWSAPI_KEY = '38c80c8927e247a7878a2b3c28c0de00';
const GNEWS_API_KEY = '1bb59b7a93ea99d26e8c3ffd18d85acb';

// Nigerian cities list for weather
const cities = ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Kaduna'];

// Containers in your HTML
const weatherContainer = document.getElementById('weather-container');
const generalNewsContainer = document.getElementById('general-news-container');
const sportsNewsContainer = document.getElementById('sports-news-container');

// Fetch and display weather for multiple cities
async function loadWeather(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},NG&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    if (!res.ok) throw new Error(`Failed to fetch weather for ${city}`);
    const data = await res.json();

    const div = document.createElement('div');
    div.className = 'city-weather';
    div.innerHTML = `
      <h3>${data.name}</h3>
      <p>Temperature: ${data.main.temp}°C</p>
      <p>Condition: ${data.weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">
    `;

    weatherContainer.appendChild(div);
  } catch (err) {
    console.error(err);
  }
}

function loadAllWeather() {
  weatherContainer.innerHTML = ''; // Clear container
  cities.forEach(city => loadWeather(city));
}

// Fetch and display general news (NewsAPI)
async function loadGeneralNews() {
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=ng&apiKey=${NEWSAPI_KEY}`
    );
    if (!res.ok) throw new Error('Failed to fetch general news');
    const data = await res.json();

    generalNewsContainer.innerHTML = '';
    data.articles.forEach(article => {
      const div = document.createElement('div');
      div.className = 'news-article';
      div.innerHTML = `
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">
          <h4>${article.title}</h4>
          <p>${article.description || ''}</p>
        </a>
      `;
      generalNewsContainer.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

// Fetch and display sports & entertainment news (GNews)
async function loadSportsNews() {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/top-headlines?topic=sports&lang=en&token=${GNEWS_API_KEY}&country=ng`
    );
    if (!res.ok) throw new Error('Failed to fetch sports news');
    const data = await res.json();

    sportsNewsContainer.innerHTML = '';
    data.articles.forEach(article => {
      const div = document.createElement('div');
      div.className = 'news-article';
      div.innerHTML = `
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">
          <h4>${article.title}</h4>
          <p>${article.description || ''}</p>
        </a>
      `;
      sportsNewsContainer.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

// Initialize everything on page load
function init() {
  loadAllWeather();
  loadGeneralNews();
  loadSportsNews();
}

window.addEventListener('DOMContentLoaded', init);
