const searchButton = document.querySelector('.search-btn');
const cityInput = document.querySelector('.city-input');
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const locationButton = document.querySelector('.location-btn');
const recentCitiesDropdown = document.querySelector('.recent-cities-dropdown');

const API_KEY = "75409518018edef1d6d9a8c3190b82af";

const createWeatherCard = (cityName, index, weatherItem) => {

    if(index === 0) {
        return `<div class="details">
        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
      <img src=" https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h4>${weatherItem.weather[0].description}</h4>
      </div>`;

    } else {
        return `<li class="card">
            <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
            <img src=" https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
              </li>`

    }
    
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        // Filter the forecast data 
        const uniqueForecastDays = [];

        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);

            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        weatherCardsDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";

        // Create weather cards and add them in DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, index, weatherItem));

            } else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, index, weatherItem));
            }
            
        })


    }).catch(() => {
        alert("An Error Occured While Fetching Coordinates")
       });
}
const getCityLocation = () => {
   const cityName = cityInput.value.trim(); //get city name and removes white spaces
   if(!cityName){
    alert("Please enter a city name.");
    return;
   }
   const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;
    
   //fetching coordinates
   fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
    if(!data.length) return alert(`No Coordinates found for ${cityName}`);
    const {name, lat, lon} = data[0];
    getWeatherDetails(name,lat,lon);
    addToRecentCities(name);

   }).catch(() => {
    alert("An Error Occured While Fetching Geocodind Api")
   });
}


// Function to fetch weather details from API based on user's current location
const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        
        // Get City name from coordinates  usin reverse Api
        fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
            const {name} = data[0];
            getWeatherDetails(name,latitude,longitude);
            addToRecentCities(name);

           }).catch(() => {
            alert("An Error Occured While Fetching the City")
           });
    },
     error => {  
     if(error.code === error.PERMISSION_DENIED){
        alert("Please allow location access to get weather details");
     }

    })
}

const populateRecentCitiesDropdown = () => {
    const recentCities = getRecentCities();
    recentCitiesDropdown.innerHTML = '<option selected disabled>Select a city</option>';
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
}

// Function to add a city to recent cities in local storage
const addToRecentCities = (cityName) => {
    let recentCities = getRecentCities();
    recentCities = recentCities.filter(city => city !== cityName); // Remove duplicate
    recentCities.unshift(cityName); // Add to the beginning
    if (recentCities.length > 5) {
        recentCities.pop(); // Limit recent cities to 5
    }
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    populateRecentCitiesDropdown();
}

// Function to get recent cities from local storage
const getRecentCities = () => {
    return JSON.parse(localStorage.getItem('recentCities')) || [];
}

// Function to handle dropdown change
const handleDropdownChange = () => {
    const selectedCity = recentCitiesDropdown.value;
    if (selectedCity !== 'Select a city') {
        const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${selectedCity}&limit=5&appid=${API_KEY}`;
        
        fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                return alert(`No Coordinates found for ${selectedCity}`);
            }
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An Error Occurred While Fetching Geocoding API");
        });
    }
}

recentCitiesDropdown.addEventListener('change', handleDropdownChange);



searchButton.addEventListener("click", getCityLocation);
locationButton.addEventListener("click", getUserLocation);
cityInput.addEventListener("keyup", event => event.key === "Enter" && getCityLocation());