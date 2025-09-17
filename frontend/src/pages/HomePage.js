import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // We'll create this CSS file

const HomePage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Sample AI-generated images for the background carousel
  const backgroundImages = [
    'https://images.unsplash.com/photo-1677442135135-416f8aa26a5b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1677442135335-7d3e550c5d51?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1677442135136-5c46c8edd5c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
  ];

  // Rotate through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div 
      className="homepage-container"
      style={{ backgroundImage: `url(${backgroundImages[currentImageIndex]})` }}
    >
      <div className="overlay"></div>
      
      <div className="content">
        <h1 className="title animate-pop-in">
          <span className="gradient-text">AI Image Generator</span>
        </h1>
        
        <p className="subtitle animate-pop-in" style={{ animationDelay: '0.3s' }}>
          Transform your imagination into stunning visual art
        </p>
        
        <p className="description animate-pop-in" style={{ animationDelay: '0.6s' }}>
          Create breathtaking images from text prompts or transform your existing photos with the power of artificial intelligence.
        </p>
        
        <div className="cta-container animate-pop-in" style={{ animationDelay: '0.9s' }}>
          <Link 
            to="/login" 
            className="cta-button primary"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Get Started
          </Link>
          
          <div className="auth-links">
            <span>Already have an account? </span>
            <Link to="/login" className="auth-link">Login</Link>
            <span> or </span>
            <Link to="/register" className="auth-link">Register</Link>
          </div>
        </div>
        
        <div className="features animate-pop-in" style={{ animationDelay: '1.2s' }}>
          <div className="feature">
            <div className="feature-icon">🎨</div>
            <h3>Text to Image</h3>
            <p>Describe what you imagine and watch AI bring it to life</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">✨</div>
            <h3>Image Enhancement</h3>
            <p>Transform and improve your existing images with AI</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🚀</div>
            <h3>Fast Generation</h3>
            <p>Get high-quality results in seconds, not hours</p>
          </div>
        </div>
      </div>
      
      <div className="scrolling-text">
        <div className="text-scroll">
          <span>Create • Imagine • Transform • Inspire • Generate • Design • Visualize • Create • Imagine • Transform</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;