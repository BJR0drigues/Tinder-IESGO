import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3.5 rounded-2xl font-display font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-coral-gradient text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:brightness-105 border border-white/10",
    secondary: "bg-iesgo-blue text-white shadow-lg shadow-iesgo-blue/30 hover:bg-blue-800",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-600 bg-transparent",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;