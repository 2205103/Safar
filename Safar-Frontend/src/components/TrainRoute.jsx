import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import './trainRoute.css';

function convertTo12HourFormat(time24) {
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseInt(hours, 10);
    const period = parsedHours >= 12 ? "PM" : "AM";
    const hours12 = parsedHours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
}

const TrainRoute = () => {
    const { id } = useParams();
    const [routes, setRoute] = useState(null);
    const [train_name, setTrainName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/trains/${id}`);
                const rec = await response.json();
                console.log(rec.data.result);
                setRoute(rec.data.result);
                const train_name = rec.data.result[0].train_name;
                setTrainName(train_name); 
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchData();
    }, [id]);

    const groupedRoutes = groupRoutesByRouteId(routes);

    return (
        <Fragment>
            <h3 style={{ marginBottom: '50px', marginTop:'50px'}}><b><center> {train_name} </center></b></h3>
            {groupedRoutes.map((group, index) => (
                <div key={index}>
                    <h4>Route {index + 1}</h4>
                    {group.map(route => (
                        <div style={{ marginBottom: '30px' }} key={route.station_id}>
                            <ul className="list-group list-group-flush" style={{ marginBottom: '30px' }}>
                                <li className="list-group-item">
                                    <img src="../../location.png" style={{ width: '20px', height: '25px' }} />
                                    <span style={{ marginLeft: '30px' }}></span>
                                    <b>{route.station_name}</b>
                                </li>
                                {route.arrival !== null && route.departure !== null && (
                                    <li className="list-group-item">
                                        Arrival: {convertTo12HourFormat(route.arrival)}
                                        <span style={{ marginLeft: '150px' }}> Departure: {convertTo12HourFormat(route.departure)}</span>
                                    </li>
                                )}
                                {route.arrival === null && route.departure !== null && (
                                    <li className="list-group-item">
                                        Departure: {convertTo12HourFormat(route.departure)}
                                    </li>
                                )}
                                {route.arrival !== null && route.departure === null && (
                                    <li className="list-group-item">
                                        Arrival: {convertTo12HourFormat(route.arrival)}
                                    </li>
                                )}
                                {route.arrival === null && route.departure === null && (
                                    <li className="list-group-item">
                                        No Arrival or Departure Information
                                    </li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </Fragment>
    );
};

const groupRoutesByRouteId = (routes) => {
    const groupedRoutes = [];
    let currentGroup = [];

    if (routes) {
        routes.forEach((route, index) => {
            if (index === 0 || route.route_id !== routes[index - 1].route_id) {
                if (currentGroup.length > 0) {
                    groupedRoutes.push(currentGroup);
                }
                currentGroup = [route];
            } else {
                currentGroup.push(route);
            }
        });
        if (currentGroup.length > 0) {
            groupedRoutes.push(currentGroup);
        }
    }

    return groupedRoutes;
};

export default TrainRoute;
