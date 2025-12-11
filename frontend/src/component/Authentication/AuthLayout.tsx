import React, { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  heroContent?: ReactNode;
  heroImage?: string;
  heroTitle?: string;
  heroDescription?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  heroContent,
  heroImage,
  heroTitle,
  heroDescription,
}) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Section */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-maroon via-purple-dark to-redish p-12 items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-maroon/90 via-purple-dark/90 to-redish/90"></div>

        <div className="relative z-10 text-white max-w-lg">
          {heroContent ? (
            heroContent
          ) : (
            <>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                {heroTitle || "Welcome to Tafakari"}
              </h1>
              <p className="text-lg text-gray-100 mb-8">
                {heroDescription ||
                  "Join thousands of job seekers and employers connecting to build successful careers and businesses across Kenya."}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Find Your Dream Job</h3>
                    <p className="text-gray-200 text-sm">
                      Browse thousands of opportunities from top employers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Easy Application</h3>
                    <p className="text-gray-200 text-sm">
                      Apply to jobs with just a few clicks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Grow Your Career</h3>
                    <p className="text-gray-200 text-sm">
                      Access resources and tips to advance your career
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        {children}
      </div>
    </div>
  );
};
