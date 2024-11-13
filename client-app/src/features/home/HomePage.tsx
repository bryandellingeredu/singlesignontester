import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import { useState } from 'react';
import { WeatherForecast } from '../../app/models/weatherForecast';
import agent from '../../app/api/agent';

export default observer(function HomePage() {
    const { userStore } = useStore();
    const [weatherForecasts, setWeatherForecasts] = useState<WeatherForecast[]>([]);
    const [error, setError] = useState('');
    const [payload, setPayload] = useState('');

    const handleOnclick = async () => {
        setError('');
        try {
            const response = await agent.WeatherForeCast.list();
            setWeatherForecasts(response);
        } catch (error) {
            console.log("Error fetching weather forecasts:");
            const err = JSON.stringify(error);
            setError(`Error fetching weather forecasts: ${err}`);
        }
    };

    const showPayload = () => {setPayload(userStore.getTokenPayload() || '')}

    return (
        <>
            <h1>React Client for Testing Single Sign On</h1>
            {!userStore.isLoggedIn ? (
                <div>
                <button onClick={userStore.login}>Login</button>
                <p>
                <button onClick={handleOnclick}>Get Weather Forecast (Protected API)</button>
                </p>
                </div>
            ) : (
                <>
                    <p>
                    <button onClick={userStore.logout}>Logout</button>
                    <button onClick={showPayload}>Show Claims From Token</button>
                    </p>
                    <strong>Token:</strong>
                    <textarea readOnly value={userStore.token!} ></textarea>
                    <p>
                    {payload && 
                    <div>
                    <h2>Claims:</h2>
                    <p>{payload}</p>
                    </div>
                    }
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
                   {error && !userStore.isLoggedIn &&
                    <div>
                    <h2>Error</h2>
                     <span>{error}</span> 
                     </div>
                    }
        </>
    );
});