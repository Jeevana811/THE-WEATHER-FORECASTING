function updateLiveDate() {
    const dateElement = document.getElementById('current-date');
    if (!dateElement) return;
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    dateElement.innerText = now.toLocaleDateString('en-GB', options);
}

function getWeather() {
    const cityname = document.getElementById('city-name').value;
    const apiKey = '7040ea904442a45d6950ba584410ce59'; 
    if (!cityname) return alert("Please enter a city!");

    const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${apiKey}&units=metric`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${apiKey}&units=metric`;

    // Fetch Current Data
    fetch(currentURL)
        .then(res => res.json())
        .then(data => {
            if(data.cod === 200) {
                document.getElementById('display-city').innerText = data.name.toUpperCase();
                document.getElementById('temp-val').innerText = `${Math.round(data.main.temp)}°C`;
                document.getElementById('description').innerText = data.weather[0].description;
                document.getElementById('humidity').innerText = `${data.main.humidity}%`;
                document.getElementById('wind-speed').innerText = `${data.wind.speed} m/s`;
                document.getElementById('real-feel').innerText = `${Math.round(data.main.feels_like)}°C`;
                document.getElementById('clouds').innerText = `${data.clouds.all}%`;
            } else {
                alert("City not found!");
            }
        })
        .catch(err => {
            console.error("Error fetching current weather:", err);
        });

    // Fetch Forecast Data
    fetch(forecastURL)
        .then(res => res.json())
        .then(data => {
            if(data.cod === "200") {
                updateForecastUI(data.list);
            }
        })
        .catch(err => {
            console.error("Error fetching forecast:", err);
        });
}

function updateForecastUI(list) {
    // 1. TODAY'S FORECAST (Every 3 hours)
    const hourlyContainer = document.getElementById('hourly-forecast');
    if (hourlyContainer) {
        hourlyContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            const item = list[i];
            if (!item) break;
            const date = new Date(item.dt * 1000);
            const hours = date.getHours().toString().padStart(2, '0');
            const time = `${hours}:00`;
            
            hourlyContainer.innerHTML += `
                <div class="hour-card">
                    <span>${time}</span><br>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" width="30px"><br>
                    <strong>${Math.round(item.main.temp)}°C</strong>
                </div>`;
        }
    }

    // 2. WEEKLY FORECAST (Showing Next 5 Days with Date)
    const weeklyContainer = document.getElementById('weekly-list');
    if (weeklyContainer) {
        weeklyContainer.innerHTML = "";
        
        const dailyForecasts = [];
        const seenDates = new Set();
        const todayDateStr = new Date().toDateString();

        for (const item of list) {
            const itemDate = new Date(item.dt * 1000);
            const dayString = itemDate.toDateString();

            // Skip today's date to list the upcoming 5 days
            if (dayString === todayDateStr) continue;

            const hour = itemDate.getHours();

            // Grouping entries to select the forecast closest to midday (12:00 PM)
            if (!seenDates.has(dayString)) {
                seenDates.add(dayString);
                dailyForecasts.push({
                    dayString: dayString,
                    item: item,
                    hourDiff: Math.abs(hour - 12)
                });
            } else {
                const existing = dailyForecasts.find(f => f.dayString === dayString);
                const currentDiff = Math.abs(hour - 12);
                if (currentDiff < existing.hourDiff) {
                    existing.item = item;
                    existing.hourDiff = currentDiff;
                }
            }
        }

        // Display the next 5 days of forecast with their dates
        dailyForecasts.slice(0, 5).forEach(forecast => {
            const item = forecast.item;
            const date = new Date(item.dt * 1000);
            
            // Format to show "Weekday, Day Month" (e.g., "Wednesday, 6 May")
            const formattedDate = date.toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short' 
            });
            
            const temp = Math.round(item.main.temp);
            const description = item.weather[0].main;
            const icon = item.weather[0].icon;

            weeklyContainer.innerHTML += `
                <div class="day-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="flex: 1.2; text-align: left; font-size: 0.95rem;">${formattedDate}</span> 
                    <span style="flex: 1; text-align: center; display: flex; align-items: center; justify-content: center; gap: 5px;">
                        <img src="https://openweathermap.org/img/wn/${icon}.png" width="30px">
                        ${description}
                    </span> 
                    <span style="flex: 1; text-align: right; font-weight: bold;">${temp}°C</span> 
                </div>`;
        });
    }
}

// Initial Call & Setup Interval
updateLiveDate();
setInterval(updateLiveDate, 60000);