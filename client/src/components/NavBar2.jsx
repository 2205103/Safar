import React from 'react'
import { Link } from 'react-router-dom';

import { BsCart2 } from "react-icons/bs";
import { BsFillTrainFreightFrontFill } from "react-icons/bs";
///////////logged in user
import { HiOutlineBars3 } from "react-icons/hi2";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './App.css';
import { BsFillPersonFill } from "react-icons/bs";

const NavBar2 = () => {
    const [openMenu, setOpenMenu] = useState(false);
    const [id, setId] = useState('');
    setId(localStorage.getItem('userId'));
    const [name, setName] = useState('');
    setId(localStorage.getItem('last_name'));
    const menuOptions = [
        {
            text: "Home",
            icon: <HomeIcon />,
        },
        {
            text: "About",
            icon: <InfoIcon />,
        },
        {
            text: "Testimonials",
            icon: <CommentRoundedIcon />,
        },
        {
            text: "Contact",
            icon: <PhoneRoundedIcon />,
        },
        {
            text: "Cart",
            icon: <ShoppingCartRoundedIcon />,
        },
    ];
    return (
        <nav>
            <div className="nav-logo-container">
                <img src={"/siren_logo.png"} alt="" />
            </div>
            <div className="navbar-links-container">
                <a href="">Home</a>
                <a href="">About</a>
                <a href="">Contact</a>
                <a href="/trains">
                    <BsFillTrainFreightFrontFill className="navbar-train-icon" />
                </a>
                <Link to={`/users/${id}`} className="primary-button">{name}</Link>
            </div>
            <div className="navbar-menu-container">
                <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
            </div>
        </nav>
    )
}

export default NavBar2
