// weather.js

async function fetchWeather(city = 'Abuja') {
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    console.log('Weather data:', data);
    // Now update your UI with weather info
    displayWeather(data);
  } catch (error) {
    console.error('Fetching weather failed:', error);
  }
}

function displayWeather(data) {
  const weatherDiv = document.getElementById('weather');
  weatherDiv.textContent = `Temperature in ${data.name}: ${data.main.temp}°C, ${data.weather[0].description}`;
}

// Call it on page load
window.addEventListener('load', () => {
  fetchWeather();
});
