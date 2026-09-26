import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function HomePage() {
    return(
        <>
            {/* Navbar */}
            <Navbar CurrentPage="home"/>

            {/* Main Content */}
            <main className="wrap">
                <div className="card hero-card">
                    <img className="logo-img" src="./images/logoWithoutName.png" alt="Wazen Logo" />
                    <h1 className="hero-title">
                        Plan. Track.<span className="gradient-text"> Wazen.</span> Succeed.
                </h1>
                <p className="">Your AI-powered companion for a balanced study and a successful academic journey. </p>
                <br />
                <Link to="/register" className="btn-main">Start Wazen-ing</Link>
                </div>
            </main>

            {/* Footer */}
                <Footer />
        </>
    );
}

export default HomePage;