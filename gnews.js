const apiKey = '1bb59b7a93ea99d26e8c3ffd18d85acb';

const fetchSportsEntertainmentNews = async () => {
  try {
    const response = await fetch(`https://gnews.io/api/v4/top-headlines?topic=sports,entertainment&lang=en&max=20&token=${apiKey}`);
    const data = await response.json();
    console.log(data.articles);
    // Use this data to display articles in your app
  } catch (error) {
    console.error('Error fetching sports & entertainment news:', error);
  }
};

fetchSportsEntertainmentNews();
