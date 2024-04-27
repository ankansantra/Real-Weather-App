const searchButton = document.querySelector('.search-btn');
const cityInput = document.querySelector('.city-input');

const API_KEY = "75409518018edef1d6d9a8c3190b82af";
const getCityLocation = () => {
   const cityName = cityInput.value.trim(); //get city name and removes white spaces
   if(!cityName) return;
   const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

   fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
    console.log(data)
   }).catch(() => {
    alert("An Error Occured While Fetching")
   });
}
searchButton.addEventListener("click", getCityLocation);