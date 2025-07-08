import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TrainInformation = () => {
    const [trains, setTrains] = useState([]);
    const [trainRoute, setTrainRoute] = useState({});
    const [trainClass, setTrainClass] = useState({});
    const [expandedTrainId, setExpandedTrainId] = useState(null);

    const getTrains = async () => {

    };

    useEffect(() => {
        // getTrains();
        const fetchData = async () => {
            console.log("=====================================")
            try {
                const response = await fetch("http://localhost:3001/admin/trains", {
                    method: "GET",
                });
                const result = await response.json();
                console.log("sjfasdbfjsdjfjsdnfjsdnfnsdfnjsnfjsdnfjnsdj")
                // console.log(JSON.stringify(result.data.trainClass)+ "////");
                console.log(result.data)
                // setTrainRoute(result.trainRoute);

                setTrains(result.data.trains);
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);



    const toggleDropdown = (trainId) => {
        console.log(trainId);
        setExpandedTrainId(expandedTrainId === trainId ? null : trainId);
    };

    return (
        <Fragment>
            <table className="table mt-5 text-container">
                <thead>
                    <tr>
                        <th>Train ID</th>
                        <th>Train Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {trains.map(train => (
                        <Fragment key={train.train_id}>
                            <tr>
                                <td style={{ fontSize: '18px' }}>{train.train_id}</td>
                                <td style={{ fontSize: '18px' }}>{train.train_name}</td>
                                
                                <td>
                                    <button onClick={() => toggleDropdown(train.train_id)}>Show Information</button>
                                </td>
                            </tr>

                            {expandedTrainId === train.train_id && (
                                <tr>
                                    <td colSpan="3">
                                        <div>
                                            <h6><strong>Tickets Booked: {train.ticketsBooked}</strong></h6>
                                            <h6 style={{marginTop:'30px'  }}><u>Train Routes:</u></h6>
                                            {train.trainRoutes && train.trainRoutes.length > 0 ? (
                                                train.trainRoutes.map((route, index) => (
                                                    <div key={index}>
                                                        <strong>Route Name:</strong> {route.route}
                                                        <p><strong>Stations:</strong> {route.stations.join(', ')}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No route information available.</p>
                                            )}

                                            <h6><u>Train Classes:</u></h6>
                                            {train.trainClass && train.trainClass.length > 0 ? (
                                                <ul>
                                                    {train.trainClass.map((tc, index) => (
                                                        <li key={index}>
                                                            {tc.class} - Seats: {tc.seats}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No class information available.</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}

                        </Fragment>
                    ))}
                </tbody>
            </table>
        </Fragment>


    );
};

export default TrainInformation;
