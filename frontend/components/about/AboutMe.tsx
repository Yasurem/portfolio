import React from 'react';

export default function AboutMe() {
  return (
    <div className="new-section-content absolute inset-0 md:left-1/2 w-full md:w-1/2 h-full flex flex-col justify-center items-start p-12 opacity-0 z-20 pointer-events-none md:pointer-events-auto">
      <h2 className="text-4xl font-bold mb-4">About Me</h2>
      <p className="text-lg text-muted-foreground">This placeholder will contain the next section's content. It fades in seamlessly as the 3D element transitions away.</p>
    </div>
  );
}
