"use client";

import React, { useState, useRef, useEffect } from "react";

import { phones_codes } from "./phonescodes";

interface Country {
  code: string;
  dial_code: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (dial_code: string) => void;
}

const CustomDialCodeSelect: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch(""); // reset search on close
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find currently selected country to show dial code
  const selectedCountry = phones_codes.find((c) => c.dial_code === value);

  // Filter countries based on search input (case insensitive)
  const filteredCountries = phones_codes.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.dial_code.includes(search),
  );

  return (
    <div className="relative w-40" ref={dropdownRef}>
      {/* Selected value */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-gray-300  px-3 py-2 text-left flex justify-between items-center bg-white"
      >
        <span>
          {selectedCountry ? selectedCountry.dial_code : "Select Code"}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-10 mt-1 h-screen max-h-[400px] w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {/* Search input */}
          <input
            type="text"
            className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
            placeholder="Search country or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <ul>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <li
                  key={country.code}
                  className={`cursor-pointer px-3 py-2 hover:bg-maroon hover:text-white ${
                    country.dial_code === value ? "bg-maroon text-white" : ""
                  }`}
                  onClick={() => {
                    onChange(country.dial_code);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {country.dial_code} {country.name}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No matches found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDialCodeSelect;
