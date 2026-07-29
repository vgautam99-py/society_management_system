import React, { useState, useRef, useEffect } from 'react';

const Popover = ({ trigger, content, position = 'bottom-center' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const positions = {
    'bottom-center': 'top-full left-1/2 -translate-x-1/2 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-center': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={`absolute z-40 w-max max-w-xs p-4 bg-white rounded-lg shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 ${positions[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Popover;
