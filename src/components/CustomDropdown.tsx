'use client';
import React, { useState } from 'react';
import Image from 'next/image';

type CustomDropdownProps = {
  onSelect: (value: string) => void; // `onSelect` is a function that takes a string and returns void
};

export const options = [
  { value: 'node-template', label: 'Node.js', icon: '/nodejs-original.svg' },
  { value: 'template', label: 'Vite.js', icon: '/Vitejs-logo.svg' },
  { value: 'vite-template', label: 'React.js', icon: '/react-original.svg' },
];

const CustomDropdown: React.FC<CustomDropdownProps> = ({ onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
    icon: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: { value: string; label: string; icon: string }) => {
    setSelectedOption(option);
    onSelect(option.value); // Notify parent about the selection
    setIsOpen(false);
  };

  return (
    <div className="relative w-56">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-600 w-full p-2 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedOption ? (
            <>
              <Image
                src={selectedOption.icon}
                alt={selectedOption.label}
                height={25}
                width={25}
              />
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className='text-slate-200 text-sm'>Select Technology</span>
          )}
        </div>
        <span className="ml-2">&#x25BC;</span>
      </button>
      {isOpen && (
        <ul className="absolute w-full bg-slate-700 rounded-lg border-2 border-slate-500 mt-2 z-10">
          {options.map((option, index) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`flex items-center ${index !== options.length - 1 && "border-b-2"} border-slate-500 p-2 hover:bg-slate-600 cursor-pointer`}
            >
              <Image
                src={option.icon}
                alt={option.label}
                height={25}
                width={25}
                className="mr-3"
              />
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
