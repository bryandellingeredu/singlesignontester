import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import { useState } from 'react';
import { WeatherForecast } from '../../app/models/weatherForecast';
import agent from '../../app/api/agent';

export default observer(function HomePage() {
    const { userStore } = useStore();
    const [weatherForecasts, setWeatherForecasts] = useState<WeatherForecast[]>([]);

    const handleOnclick = async () => {
        try {
            debugger;
            const response = await agent.WeatherForeCast.list();
            setWeatherForecasts(response);
        } catch (error) {
            console.error("Error fetching weather forecasts:", error);
        }
    };

    return (
        <>
            <h1>React Client for Testing Single Sign On</h1>
            {!userStore.isLoggedIn ? (
                <button onClick={userStore.login}>Login</button>
            ) : (
                <>
                    <strong>Token:</strong>
                    <textarea readOnly value={userStore.token!} ></textarea>
                    <p>
                    <button onClick={handleOnclick}>Get Weather Forecast (Protected API)</button>
                    </p>
                   

                    {/* Display the weather forecasts */}
                    {weatherForecasts.length > 0 && (
                        <div>
                            <h2>Weather Forecasts</h2>
                            <ul>
                                {weatherForecasts.map((forecast, index) => (
                                    <li key={index}>
                                        <strong>Date:</strong> {forecast.date} <br />
                                        <strong>Temperature (C):</strong> {forecast.temperatureC}°C <br />
                                        <strong>Temperature (F):</strong> {forecast.temperatureF}°F <br />
                                        <strong>Summary:</strong> {forecast.summary}
                                        <hr />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </>
    );
});