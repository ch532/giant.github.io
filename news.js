const apiKey = '38c80c8927e247a7878a2b3c28c0de00';  // Your News API key

fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey=${apiKey}`)
  .then(response => response.json())
  .then(data => {
    console.log(data.articles);
    // You can now loop through articles and display them in your app
  })
  .catch(error => {
    console.error('Error fetching news:', error);
  });
