export async function fetchMediastackNews(container) {
  const mediastackApiKey = '8e03f94d0c0de12d21b5edd19d5e5bd0';
  try {
    let urlNg = `http://api.mediastack.com/v1/news?access_key=${mediastackApiKey}&countries=ng&categories=general&limit=5`;
    let responseNg = await fetch(urlNg);
    let dataNg = await responseNg.json();

    let urlWorld = `http://api.mediastack.com/v1/news?access_key=${mediastackApiKey}&categories=general&limit=5`;
    let responseWorld = await fetch(urlWorld);
    let dataWorld = await responseWorld.json();

    displayNews(dataNg.data, container, 'Mediastack Nigeria News');
    displayNews(dataWorld.data, container, 'Mediastack World News');
  } catch (error) {
    container.innerHTML = 'Error loading Mediastack news.';
    console.error(error);
  }
}
