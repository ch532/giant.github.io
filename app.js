// Your API keys — replace these with your actual keys
const NEWSAPI_KEY = '38c80c8927e247a7878a2b3c28c0de00';    // NewsAPI
const GNEWS_KEY = '1bb59b7a93ea99d26e8c3ffd18d85acb';      // GNews
const WEATHER_API_KEY = 'a65d564a892d82cd09d48a43888a1139'; // OpenWeatherMap

// Nigerian cities for weather
const cities = ['Lagos', 'Abuja', 'Kano'];

// Fetch general news from NewsAPI
async function fetchGeneralNews() {
  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${NEWSAPI_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const container = document.getElementById('general-news-container');
    container.innerHTML = ''; // clear previous content

    if(data.articles && data.articles.length) {
      data.articles.forEach(article => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a>`;
        container.appendChild(div);
      });
    } else {
      container.textContent = 'No news found.';
    }
  } catch (err) {
    console.error('Error fetching general news:', err);
  }
}

// Fetch sports & entertainment news from GNews
async function fetchSportsNews() {
  const url = `https://gnews.io/api/v4/search?q=sports OR entertainment&lang=en&max=5&token=${GNEWS_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const container = document.getElementById('sports-news-container');
    container.innerHTML = ''; // clear previous content

    if(data.articles && data.articles.length) {
      data.articles.forEach(article => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a>`;
        container.appendChild(div);
      });
    } else {
      container.textContent = 'No sports news found.';
    }
  } catch (err) {
    console.error('Error fetching sports news:', err);
  }
}

// Fetch weather for Nigerian cities
async function fetchWeather() {
  const container = document.getElementById('weather-container');
  container.innerHTML = ''; // clear previous content

  for (const city of cities) {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},NG&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await res.json();

      if (data.weather && data.weather.length > 0 && data.main) {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${city}</strong>: ${data.weather[0].description}, Temp: ${data.main.temp}°C`;
        container.appendChild(div);
      } else {
        const div = document.createElement('div');
        div.textContent = `Weather info unavailable for ${city}`;
        container.appendChild(div);
      }
    } catch (err) {
      console.error(`Error fetching weather for ${city}:`, err);
    }
  }
}

// Run all fetches when the page loads
window.addEventListener('DOMContentLoaded', () => {
  fetchGeneralNews();
  fetchSportsNews();
  fetchWeather();
});
