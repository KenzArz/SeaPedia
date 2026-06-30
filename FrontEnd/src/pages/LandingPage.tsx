import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "../styles/snapScroll.css";

import HeroSection from "../components/landing/HeroSection";
import HowItWorks from "../components/landing/HowItWorks";
import FeaturedProducts from "../components/landing/FeaturedProducts";
import FooterCTA from "../components/landing/FooterCTA";

const SECTIONS = ["hero", "how-it-works", "products", "cta"] as const;

export default function LandingPage() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeSection, setActiveSection] = useState<number>(0);
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		const onResize = () => {
			setIsMobile(window.matchMedia("(max-width: 768px)").matches);
		};

		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const location = useLocation();

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		if (isMobile) {
			setActiveSection(0);
			return;
		}

		const handleScroll = () => {
			const scrollTop = container.scrollTop;
			const viewportHeight = container.clientHeight;
			const index = Math.round(scrollTop / viewportHeight);
			setActiveSection(index);
		};

		container.addEventListener("scroll", handleScroll, { passive: true });
		return () => container.removeEventListener("scroll", handleScroll);
	}, [isMobile]);

	useEffect(() => {
		if (isMobile) return;
		const hash = `#${SECTIONS[activeSection]}`;
		if (window.location.hash !== hash) {
			window.history.replaceState(null, "", hash);
		}
	}, [activeSection, isMobile]);

	useEffect(() => {
		if (!location) return;
		if (!containerRef.current) return;
		const hash = location.hash.replace("#", "");
		const idx = SECTIONS.indexOf(hash as (typeof SECTIONS)[number]);
		if (idx >= 0 && !isMobile) {
			containerRef.current.scrollTo({
				top: idx * containerRef.current.clientHeight,
				behavior: "smooth",
			});
			setActiveSection(idx);
		}
	}, [location.hash, isMobile]);

	useEffect(() => {
		if (isMobile) return;
		const handleKey = (e: KeyboardEvent) => {
			const container = containerRef.current;
			if (!container) return;
			const vh = container.clientHeight;
			if (e.key === "ArrowDown" || e.key === "PageDown") {
				e.preventDefault();
				container.scrollBy({ top: vh, behavior: "smooth" });
			}
			if (e.key === "ArrowUp" || e.key === "PageUp") {
				e.preventDefault();
				container.scrollBy({ top: -vh, behavior: "smooth" });
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [isMobile]);

	const goToSection = useCallback((index: number) => {
		const container = containerRef.current;
		if (!container) return;
		container.scrollTo({
			top: index * container.clientHeight,
			behavior: "smooth",
		});
	}, []);

	return (
		<>
			{!isMobile && (
				<div className="snap-dots" aria-hidden>
					{SECTIONS.map((s, i) => (
						<button
							key={s}
							className={`snap-dot ${i === activeSection ? "snap-dot--active" : ""}`}
							onClick={() => goToSection(i)}
							aria-label={`Go to ${s} section`}
						/>
					))}
				</div>
			)}

			{!isMobile && activeSection === 0 && (
				<div className="snap-scroll-hint" aria-hidden>
					<div className="snap-scroll-icon">
						<div className="snap-scroll-wheel" />
					</div>
					<div className="snap-scroll-text">Scroll</div>
				</div>
			)}

			<div className="snap-container" ref={containerRef}>
				<div className="snap-section" data-section="hero">
					<HeroSection />
				</div>

				<div className="snap-section" data-section="how-it-works">
					<HowItWorks />
				</div>

				<div className="snap-section" data-section="products">
					<FeaturedProducts />
				</div>

				<div className="snap-section" data-section="cta">
					<FooterCTA />
				</div>
			</div>
		</>
	);
}
