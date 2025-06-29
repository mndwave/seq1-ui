import React from "react";

export default function MndwaveButton() {
  return (
    <button 
      onClick={() => window.open("https://github.com/mndwave", "_blank")}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
      title="DM MNDWAVE on GitHub"
    >
      DM MNDWAVE
    </button>
  );
}

export { MndwaveButton };
