"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Testmonials.css";
import Stats from "@/component/Homepage/Stats/Stats";
type Testimonial = {
  id: number;
  name: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "HELEN",
    role: "Project Manager",
    image:
      "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600",
    quote:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa alias, pariatur odio libero eligendi rem.",
  },
  {
    id: 2,
    name: "JAMES",
    role: "Software Engineer",
    image:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
    quote:
      "Excellent platform! It has helped me grow both professionally and personally.",
  },
  {
    id: 3,
    name: "SARAH",
    role: "Content Writer",
    image:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600",
    quote:
      "The community and support are unmatched. I highly recommend it to newcomers.",
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const Testimonials: React.FC = () => {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);

  const paginate = (newDirection: number) => {
    const newIndex =
      (index + newDirection + testimonials.length) % testimonials.length;
    setIndex([newIndex, newDirection]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 2000);

    return () => clearInterval(interval); 
  }, [index]); 

  const testimonial = testimonials[index];

  return (
    <div className="mx-auto p-6 text-center bg-gradient-to-br testmonials text-white">
      {/* <div className="relative flex items-center justify-center max-7xl">
        <button
          onClick={() => paginate(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-maroon hover:bg-redish text-white p-3 rounded-full shadow-md transition-all duration-300 hover:scale-105 focus:outline-none cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={testimonial.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="p-6 max-w-[500px] bg-black/60"
          >
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-[--color-maroon]"
            />
            <h3 className="text-xl font-bold text-maroon uppercase">
              {testimonial.name}
            </h3>
            <p className="text-sm text-white mb-2">({testimonial.role})</p>
            <p className="italic text-white">"{testimonial.quote}"</p>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => paginate(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-maroon hover:bg-redish text-white p-3 rounded-full shadow-md transition-all duration-300 hover:scale-105 focus:outline-none cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div> */}
      <Stats/>
    </div>
  );
};

export default Testimonials;
