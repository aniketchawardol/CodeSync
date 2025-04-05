import React from "react";

function Background(params) {
  return (
    <div className="background-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
        <defs>
          <radialGradient
            id="cornerGradient1"
            cx="0%"
            cy="0%"
            r="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#d13ba1" />
            <stop offset="100%" stop-color="#d13ba100" />
          </radialGradient>
          <radialGradient
            id="cornerGradient2"
            cx="100%"
            cy="0%"
            r="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#f09819" />
            <stop offset="100%" stop-color="#f0981900" />
          </radialGradient>
          <radialGradient
            id="cornerGradient3"
            cx="0%"
            cy="100%"
            r="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#2980b9" />
            <stop offset="100%" stop-color="#2980b900" />
          </radialGradient>
          <radialGradient
            id="cornerGradient4"
            cx="100%"
            cy="100%"
            r="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#45b649" />
            <stop offset="100%" stop-color="#45b64900" />
          </radialGradient>
        </defs>

        <rect width="800" height="800" fill="#8861aa" />

        <rect width="800" height="800" fill="url(#cornerGradient1)" />
        <rect width="800" height="800" fill="url(#cornerGradient2)" />
        <rect width="800" height="800" fill="url(#cornerGradient3)" />
        <rect width="800" height="800" fill="url(#cornerGradient4)" />

        <rect width="800" height="800" fill="#ffffff" opacity="0.03" />
      </svg>
    </div>
  );
}

export default Background;