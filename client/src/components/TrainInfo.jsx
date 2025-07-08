import React, { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const TrainInfo = () => {
    const [trains, setTrains] = useState([]);

    const getTrains = async () => {
        try {
            const response = await fetch("http://localhost:3001/trains");
            const jsondata = await response.json();
            setTrains(jsondata.data?.trains || []); // Safe access and default to an empty array
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getTrains();
    }, []);     
    console.log(trains);

    return (
        <Fragment>
        <table className="table mt-5 text-container">
            <thead>
                <tr>
                    <th>Train ID</th>
                    <th>Train Name</th>
                    
                </tr>
            </thead>
            <tbody>
                {trains.map(train => (
                    <tr>
                        <td style={{ fontSize: '18px' }}><Link to={`/train/${train.train_id}`} className="link-style">{train.train_id}</Link></td>
                        <td style={{ fontSize: '18px' }}><Link to={`/train/${train.train_id}`} className="link-style">{train.train_name}</Link></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Fragment>
    );
};

export default TrainInfo;
