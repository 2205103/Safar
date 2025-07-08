import React, { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import UpdateUser from './UpdateUser';

const UserList = () => {

    const [users, setUsers] = useState([]);
    const navigate= useNavigate();

    const registerUser = () => {
        try {
            navigate('/users');
        } catch (err) {
            console.error(err.message);
        }
    }
    // delete user
    const deleteUser = async (id) => {
        try {
            const deleteUser = await fetch(`http://localhost:3001/users/${id}`,
                {
                    method: "DELETE"
                });
            console.log("user deleted " + id);
            setUsers(users.filter(user => user.user_id !== id));    // refesh charai update kore basically filter kore ney
        }
        catch (err) {
            console.error(err.message)
        }
    }

    //update user
    const updateUser = async (user) => {
        try {
            const updateUser = await fetch(`http://localhost:3001/users/${user.user_id}/update`,
            {
                method : "PUT"
            });
            window.location = "/";
            //console.log("user updated " + user.user_id);
        }
        catch (err) {
            console.error(err.message)
        }
    }


    const getUsers = async () => {
        try {
            const response = await fetch("http://localhost:3001/users")
            const jsondata = await response.json();
            // console.log(data);
            // if (!response.ok) {
            //     throw new Error('Network response was not ok.');
            // }


            setUsers(jsondata.data.users);
        }
        catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getUsers();
    }, []);     // to make sure 1 ta req dicchi
    console.log(users);

    return (

        <Fragment>
            <button className='btn btn-success ' onClick={ ()=> registerUser()}>Register</button>
            <table className="table mt-5 text-container">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Contact Information</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr>
                            <td>{user.user_id}</td>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.phone_number}</td>
                            <td><UpdateUser user = {user}/></td>
                            <td><button className='btn btn-danger' onClick={() => deleteUser(user.user_id)}>Delete</button></td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </Fragment>
    )
}

export default UserList