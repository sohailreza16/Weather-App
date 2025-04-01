const input = document.querySelector("#city");
const getWeather = document.querySelector("#getWeather");
const useLocation = document.querySelector("#useLocation");
const recentCitiesDropdown = document.querySelector("#recentCities");

const APIkey = "30c33736fcf2b108082f80f043e1542a";

// Load recent cities from localStorage
const loadRecentCities = () => {
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCitiesDropdown.innerHTML = ""; // Clear dropdown options
  if (recentCities.length > 0) {
    recentCitiesDropdown.classList.remove("hidden");
    recentCities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      recentCitiesDropdown.appendChild(option);
    });
  }
};

// Save a city to localStorage
const saveCity = (city) => {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    if (recentCities.length > 5) {
      recentCities.shift(); // Keep only the last 5 cities
    }
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
  }
};

// Get weather details from the API
const getDetails = (cityName, lat, lon) => {
  const weatherApiUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}`;

  fetch(weatherApiUrl)
    .then(response => response.json())
    .then(result => {
      const days = [];
      console.log(result);
      const weatherdata = result.list.filter(data => {
        const forecast = new Date(data.dt_txt).getDate();
        if (!days.includes(forecast)) {
          return days.push(forecast);
        }
      });

      document.querySelector("#weatherCity").innerHTML = `City: ${cityName} (${weatherdata[0].dt_txt.split(" ")[0]})`;
      document.querySelector("#weatherTemp").innerHTML = `temp: ${(weatherdata[0].main.temp - 273.15).toFixed(2)} °C`;
      document.querySelector("#weatherWind").innerHTML = `wind: ${weatherdata[0].wind.speed} m/s`;
      document.querySelector("#weatherHumidity").innerHTML = `humidity: ${weatherdata[0].main.humidity} %`;
      document.querySelector("#weatherIcon").src = `https://openweathermap.org/img/wn/${weatherdata[0].weather[0].icon}@2x.png`;
      document.querySelector("#weatherDescription").innerHTML = `${weatherdata[0].weather[0].description}`;

      for (let i = 1; i <= 5; i++) {
        document.querySelector(`#date${i}`).innerHTML = `${weatherdata[i].dt_txt.split(" ")[0]}`;
        document.querySelector(`#icon${i}`).src = `https://openweathermap.org/img/wn/${weatherdata[i].weather[0].icon}@2x.png`;
        document.querySelector(`#temp${i}`).innerHTML = `temp: ${(weatherdata[i].main.temp - 273.15).toFixed(2)} °C`;
        document.querySelector(`#wind${i}`).innerHTML = `wind: ${weatherdata[i].wind.speed} m/s`;
        document.querySelector(`#humidity${i}`).innerHTML = `humidity: ${weatherdata[i].main.humidity} %`;
      }

      saveCity(cityName); // Save the city to localStorage
      loadRecentCities(); // Reload recent cities after adding a new one
    })
    .catch((error) => {
      alert(error);
    });
};

// Get coordinates based on city input
const getCoordinates = (city) => {
  const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIkey}`;

  fetch(geoApiUrl)
    .then(response => response.json())
    .then(result => {
      if (!result.length) return alert("City not found");
      const name = result[0].name;
      const lat = result[0].lat;
      const lon = result[0].lon;
      getDetails(name, lat, lon);
    })
    .catch((error) => {
      alert(error);
    });
};

// Get the user's current location
const getLocation = () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const reverseGeoApiUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${APIkey}`;

    fetch(reverseGeoApiUrl)
      .then(response => response.json())
      .then(result => {
        const name = result[0].name;
        getDetails(name, lat, lon);
      })
      .catch((error) => {
        alert(error);
      });
  },
    error => {
      alert(error);
    });
};

// Event listener for the 'Get Weather' button
getWeather.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) {
    getCoordinates(city);
  }
});

// Event listener for Enter key in input field
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = input.value.trim();
    if (city) {
      getCoordinates(city);
    }
  }
});

// Event listener for the 'Use Current Location' button
useLocation.addEventListener("click", getLocation);

// Event listener for selecting a recent city from the dropdown
recentCitiesDropdown.addEventListener("click", (e) => {
  const selectedCity = e.target.value;
  input.value = selectedCity; // Update the input field with the selected city
  getCoordinates(selectedCity); // Fetch weather details for the selected city
});

// Load recent cities on page load
loadRecentCities();

// Initialize the dropdown visibility
recentCitiesDropdown.classList.add("hidden"); // Hide dropdown initially
