export async function fetchNewsDataNews(container) {
  const newsDataApiKey = 'pub_030e9a25dd4542d58c4d9704b524014b';
  try {
    let urlNg = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&country=ng&category=general&page=1`;
    let responseNg = await fetch(urlNg);
    let dataNg = await responseNg.json();

    let urlWorld = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&category=general&page=1`;
    let responseWorld = await fetch(urlWorld);
    let dataWorld = await responseWorld.json();

    displayNews(dataNg.results, container, 'NewsData.io Nigeria News');
    displayNews(dataWorld.results, container, 'NewsData.io World News');
  } catch (error) {
    container.innerHTML = 'Error loading NewsData.io news.';
    console.error(error);
  }
}

// Also export displayNews or import it from a utilities file if needed.
