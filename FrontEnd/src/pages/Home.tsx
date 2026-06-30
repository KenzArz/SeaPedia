import React from "react";
import { Link } from "react-router-dom";
import HeroSection from "../components/landing/HeroSection";
import HowItWorks from "../components/landing/HowItWorks";
import FeaturedProducts from "../components/landing/FeaturedProducts";
import FooterCTA from "../components/landing/FooterCTA";

export const Home: React.FC = () => {
	return (
		<div className="home-page-layout">
			<HeroSection />

			<div className="share-experience-bar">
				<Link to="/reviews" className="share-experience-link">
					Bagikan pengalamanmu &rarr;
				</Link>
			</div>

			<HowItWorks />
			<FeaturedProducts />
			<FooterCTA />
		</div>
	);
};

export default Home;
