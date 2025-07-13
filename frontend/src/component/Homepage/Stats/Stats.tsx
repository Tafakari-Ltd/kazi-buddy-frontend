"use client";
import React from "react";
import CountUp from "react-countup";
import { Briefcase, Users, FileText, Building2 } from "lucide-react";

const stats = [
  {
    icon: <Briefcase className="w-10 h-10 text-maroon" />,
    label: "Jobs",
    value: 12050,
  },
  {
    icon: <Users className="w-10 h-10 text-maroon" />,
    label: "Members",
    value: 10890,
  },
  {
    icon: <FileText className="w-10 h-10 text-maroon" />,
    label: "Resume",
    value: 800,
  },
  {
    icon: <Building2 className="w-10 h-10 text-maroon" />,
    label: "Company",
    value: 9050,
  },
];

const Stats = () => {
  return (
    <div className="bg-gradient-to-br  text-white py-20  md:px-12">
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded shadow-xl hover:scale-105 transition-transform duration-300"
          >
            <div className="flex justify-center items-center mb-4">
              {stat.icon}
            </div>
            <p className="text-4xl font-extrabold text-black drop-shadow-md">
              <CountUp end={stat.value} duration={2.5} separator="," />
            </p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
