import React, { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import "../index.css";

const HeroSection = () => {
  const heroref = useRef(null);
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  useEffect(() => {
    const imageElement = heroref.current;

    const handleOnScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleOnScroll);

    return () => window.removeEventListener("scroll", handleOnScroll);
  }, []);

  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center ">
        <h1 className="text-5xl md:text-8xl lg:text-[80px] gradient-title">
          Manages Your Finances <br /> with Intelligence
        </h1>
        <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
          An AI-driven financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to={"/dashboard"}>
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link to={"/dashboard"}>
            <Button size="lg" variant="outline" className="px-8">
              Demo
            </Button>
          </Link>
        </div>

        <div className="hero-image-wrapper">
          <div ref={heroref} className="hero-image">
            <img
              src="/aiBanner.webp"
              alt=""
              width={1180}
              height={720}
              className="rounded-lg shadow-2xl border mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
