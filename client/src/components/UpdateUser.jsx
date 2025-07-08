import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';

const UpdateUser = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [address, setAddress] = useState('');
    const [post_code, setPostcode] = useState('');
    const [phone_number, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [new_password, setNewPassword] = useState('');
    const [date_of_birth, setDOB] = useState('');
    const [birth_registration_number, setBirthReg] = useState('');

    useEffect(() => {
        // Fetch user data here and update state accordingly
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/users/${id}`);
                const userData = await response.json();
                setUser(userData.data.result);
                // Set state variables here based on userData
                setAddress(userData.data.result.address || '');
                setPostcode(userData.data.result.post_code || '');
                setPhone(userData.data.result.phone_number || '');
                setEmail(userData.data.result.email || '');
                setDOB(userData.data.result.date_of_birth || '');
                setBirthReg(userData.data.result.birth_registration_number || '');
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchUserData();
    }, [id]);


    const UpdateInformation = async (e) => {
        e.preventDefault();
        try {
            if (!password) {
                console.log("enter password");
                return;
            }
            const body = { address, post_code, phone_number, email, password, date_of_birth, birth_registration_number, new_password }
            const res = await fetch(`http://localhost:3001/users/${id}/update`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
            window.location = "/";
            console.log("updated")
            console.log(res)
        } catch (err) {
            console.error(err.message);
        }
    }

    const resetInfo = () => {
        // setAddress(user.address);
        // setPostcode(user.post_code);
        // setPhone(user.phone_number);
        // setEmail(user.email);
        // setPassword('');
        // setDOB(user.date_of_birth);
        // setBirthReg(user.birth_registration_number);
    }


    return <Fragment>

        <button type="button" className="btn btn-warning" data-toggle="modal" data-target={`#id${id}`}>
            Edit
        </button>


        <div className="modal" id={`id${id}`}>
            <div className="modal-dialog">
                <div className="modal-content">

                    <div className="modal-header">
                        <h4 className="modal-title">Update your information</h4>
                        <button type="button" className="close" data-dismiss="modal" onClick={() => { resetInfo() }}>&times;</button>
                    </div>

                    <div className="modal-body">
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Address'
                            value={address || ''}
                            onChange={e => setAddress(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Postcode'
                            value={post_code || ''}
                            onChange={e => setPostcode(e.target.value)}
                        />

                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Phone number'
                            value={phone_number || ''}
                            onChange={e => setPhone(e.target.value)}
                        />

                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Email'
                            value={email || ''}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Date of birth'
                            value={date_of_birth}
                            onChange={e => setDOB(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder='Birth registration number'
                            value={birth_registration_number || ''}
                            onChange={e => setBirthReg(e.target.value)}
                        />

                        <h2>Change password</h2>
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Old password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            className="form-control mb-2"
                            placeholder="New password"
                            value={new_password || ''}
                            onChange={e => setNewPassword(e.target.value)}
                        />

                        {/*<input type="text" className='form-control' placeholder='First name' value={first_name} onChange={e => setFirstName(e.target.value)} /> */}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-warning" data-dismiss="modal" onClick={e => UpdateInformation(e)}>Confirm</button>
                        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={() => { resetInfo() }}>Close</button>
                    </div>

                </div>
            </div>
        </div>
    </Fragment>
}

export default UpdateUser;