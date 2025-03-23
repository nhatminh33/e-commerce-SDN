import React from 'react';

const Search = ({ inputClass, value, onChange, placeholder }) => {
    return (
        <div className="flex items-center relative">
            <input
                type="text"
                placeholder={placeholder || "Search..."}
                className={`px-3 py-2 outline-none border bg-transparent border-slate-600 rounded-md text-[#d0d2d6] focus:border-indigo-500 overflow-hidden ${inputClass}`}
                onChange={onChange}
                value={value}
            />
            <span className="absolute right-0 text-[#d0d2d6] pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </span>
        </div>
    );
};

export default Search; 