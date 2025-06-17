const apiKeys = {
  newsApi: '38c80c8927e247a7878a2b3c28c0de00',
  gNews: '1bb59b7a93ea99d26e8c3ffd18d85acb',
  openWeather: 'a65d564a892d82cd09d48a43888a1139'
};

// Base URLs
const endpoints = {
  newsApi: 'https://newsapi.org/v2/top-headlines',
  gNews: 'https://gnews.io/api/v4/top-headlines',
  openWeather: 'http://api.openweathermap.org/data/2.5/weather'
};

// Fetch general news from NewsAPI or GNews (your choice)
async function fetchGeneralNews() {
  try {
    // Example with GNews for general news
    const response = await fetch(`${endpoints.gNews}?lang=en&max=20&token=${apiKeys.gNews}`);
    const data = await response.json();
    displayArticles(data.articles, 'general-news-container');
  } catch (error) {
    console.error('Error fetching general news:', error);
  }
}

// Fetch sports & entertainment news from GNews
async function fetchSportsEntertainmentNews() {
  try {
    const response = await fetch(`${endpoints.gNews}?topic=sports,entertainment&lang=en&max=20&token=${apiKeys.gNews}`);
    const data = await response.json();
    displayArticles(data.articles, 'sports-entertainment-container');
  } catch (error) {
    console.error('Error fetching sports & entertainment news:', error);
  }
}

// Utility: Display articles in the given container
function displayArticles(articles, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous content

  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');

    articleElement.innerHTML = `
      <h3><a href="${article.url || article.articleUrl}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
      <p>${article.description || article.content || ''}</p>
      <img src="${article.image || article.image_url || ''}" alt="${article.title}" />
    `;

    container.appendChild(articleElement);
  });
}

// Initialize function to load all news on app start or page load
function initializeApp() {
  fetchGeneralNews();
  fetchSportsEntertainmentNews();
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeApp);
