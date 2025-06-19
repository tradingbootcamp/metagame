import React from 'react';

interface ButtonProps {
  link?: string;
  target?: string;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ link, target, children, className = '' }) => {
  const bg = 'bg-gradient-to-r from-fuchsia-500 via-amber-500 to-fuchsia-500';
  
  return (
    <a 
      href={link} 
      target={target} 
      className={`btn-container relative inline-block hover:scale-105 transition-all ${className}`}
    >
      <div className={`btn-blur ${bg} absolute top-0 left-0 right-0 bottom-0 -z-10 transition-all duration-300 opacity-30 blur-lg transform translate-y-1 rounded-md`}>
      </div>
      <div className={`tickets-btn ${bg} relative transition-all duration-300 rounded-md p-0.5 font-bold bg-[length:200%_200%] bg-[position:-100%_0] hover:bg-[position:100%_0]`}>
        <div className="content uppercase transition-all duration-1000 bg-dark-500 text-white w-full h-full px-12 rounded-md py-3">
          {children}
        </div>
      </div>
    </a>
  );
}; 