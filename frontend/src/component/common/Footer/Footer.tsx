"use client";
import React from "react";
import Link from "next/link";
import { Twitter, Facebook, Youtube, Linkedin, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-maroon via-purple-dark to-redish text-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div>
          <Link href="/" className="text-2xl font-extrabold text-white">
            Kazi<span className="text-gray-800">Buddy</span>
          </Link>
          <p className="text-purple-100 text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil,
            beatae dolor. Quia fuga quas ex hic? Molestias illum facere aliquid
            nihil.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-purple-100 text-sm">
            <li>
              <Link href="#">About Us</Link>
            </li>
            <li>
              <Link href="#">Support</Link>
            </li>
            <li>
              <Link href="#">License</Link>
            </li>
            <li>
              <Link href="#">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="#">Privacy Policy</Link>
            </li>
            <li>
              <Link href="#">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Trending Jobs */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Trending Jobs</h3>
          <ul className="space-y-2 text-purple-100 text-sm">
            <li>
              <Link href="#">Android Developer</Link>
            </li>
            <li>
              <Link href="#">Senior Accountant</Link>
            </li>
            <li>
              <Link href="#">Frontend Developer</Link>
            </li>
            <li>
              <Link href="#">Junior Tester</Link>
            </li>
            <li>
              <Link href="#">Project Manager</Link>
            </li>
          </ul>
        </div>

        {/* Follow Us & Newsletter */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex items-center gap-4 mb-6">
            <a href="#" className="hover:text-purple-300 transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-purple-300 transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-purple-300 transition">
              <Youtube size={20} />
            </a>
            <a href="#" className="hover:text-purple-300 transition">
              <Linkedin size={20} />
            </a>
          </div>
          <div className="flex bg-white rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Your email"
              className="px-4 py-2 w-full text-sm text-gray-800 outline-none"
            />
            <button className="bg-maroon hover:bg-redish text-white px-4 flex items-center justify-center transition">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-purple-200 text-sm">
        © {new Date().getFullYear()} YourCompany. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
