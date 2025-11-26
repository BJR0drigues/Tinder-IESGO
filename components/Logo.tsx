import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ className, variant = 'default' }) => {
  // Certifique-se de ter o arquivo logo.png na pasta raiz/public do projeto
  const logoSrc = "/Logo.png";

  return (
    <img
      src={logoSrc}
      alt="Tinder IESGO Logo"
      className={`${className} object-cover ${variant === 'white' ? 'brightness-0 invert drop-shadow-md' : ''}`}
      draggable={false}
    />
  );
};

export default Logo;