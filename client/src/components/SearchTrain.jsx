import React, { Fragment, useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import './comp.css';

const TrainInfo = () => {
    const [trains, setTrains] = useState([]);
    // const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const getTrains = async () => {
        try {
            const response = await fetch("http://localhost:3001/trains");
            const jsondata = await response.json();
            setTrains(jsondata.data?.trains || []);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getTrains();
    }, []);

    const onChangeFunc = async (e) => {
        const value = e.target.value;
        setInputValue(value);

        try {
            const response = await fetch(`http://localhost:3001/search?name=${value}`, {
                method: "GET",
            });

            const res = await response.json();
            const received = res.data.result;
            console.log(received);
            if (Array.isArray(received)) {
                //setData(received);
                setTrains(received);
            } else {
                //setData([]);
                setTrains([]);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <Fragment>
            <div>
                
                <div style={{marginTop:'40px'}}><h4>Select Your Preferred Train:</h4></div>
                <label htmlFor="search"></label>
                <input
                    type="text"
                    id="search"
                    onChange={onChangeFunc} value={inputValue}
                    style={{ width: '300px', marginRight: '10px' }}
                    placeholder="Train Name"
                    className='search-bar'
                />
            </div>
            <table className="table mt-5 text-container">
                <thead>
                    <tr>
                        <th>Train ID</th>
                        <th>Train Name</th>
                    </tr>
                </thead>
                <tbody>
                    {trains.map(train => (
                        <tr key={train.train_id}>
                            <td style= {{fontSize:'18px'}}><Link to={`/train/${train.train_id}`} className="link-style">{train.train_id}</Link></td>
                            <td style= {{fontSize:'18px'}}><Link to={`/train/${train.train_id}`} className="link-style">{train.train_name}</Link></td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </Fragment>
    );
};

export default TrainInfo;