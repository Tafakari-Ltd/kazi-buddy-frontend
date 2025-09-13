"use client"

import React from "react";

import "./getStarted.css";

import { useRouter } from "next/navigation";


const Getstarted = () => {
  const router = useRouter();

  return (
    <div className="getstarted-container ">
      <div className="">
        <video
          className="background-video"
          src="/videos/getStartedBg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="content container ">
          <h3 className="text-3xl font-bold text-white mb-4">
            LOOKING FOR A JOB
          </h3>
          <p className="text-white mb-6">
            Join thousands of employers and earn what you deserve!
          </p>
          <button
            className="apply-button"
            onClick={() => {
              router.push("/jobs");
            }}
          >
            GET STARTED NOW
          </button>

          <div className="jobs-list   p-6">
            <h4 className="text-2xl font-semibold text-white mb-6 text-center">
              Best Jobs You Can Start Without Experience
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Getstarted;
