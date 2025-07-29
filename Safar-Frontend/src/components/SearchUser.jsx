import React, { useState } from 'react';
import './comp.css';

const SearchUser = () => {
    const [inputValue, setInputValue] = useState('');
    const [data, setData] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [showInfoData, setInfoData] = useState([]);
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
                setData(received);
                setSuggestions(received.map(item => item.train_name));
            } else {
                setData([]);
                setSuggestions([]);
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const onSelectSuggestion = (selectedSuggestion) => {
        setInputValue(selectedSuggestion);
        setSelectedSuggestion(selectedSuggestion);
        setSuggestions([]);
    }

    const onSearch = async () => {
        try {
            const response = await fetch(`http://localhost:3001/trains/name/search?name=${selectedSuggestion}`, {
                method: "GET",
            });

            const res = await response.json();
            const received = res.data.result;
            console.log("search")
            console.log(received)
            setInfoData(received)

            //baki info show kora
            // ekta selected search suggestion theke user info ber korbo

        } catch (err) {
            setInfoData([]);
            console.error(err.message);
        }
    }

    return (
        <div className="container">
            <div className="search">
                <div>
                    <input type="text" style={{ width: '200px' }} onChange={onChangeFunc} value={inputValue} />
                    <button onClick={onSearch}>search</button>
                </div>
                <div className="drop-down">
                    {
                        suggestions.map((item, index) => (
                            <div key={index} onClick={() => onSelectSuggestion(item)}>
                                {item}
                                <hr />
                            </div>
                        ))
                    }
                </div>
            </div>
            {showInfoData.length > 0 && (
                <div className="user-info">
                    <h3>Train Information</h3>
                    <p>ID: {showInfoData[0].train_id}</p>
                    <p>Name: {showInfoData[0].train_name}</p>
                </div>
            )}
        </div>
    );
}

export default SearchUser;
