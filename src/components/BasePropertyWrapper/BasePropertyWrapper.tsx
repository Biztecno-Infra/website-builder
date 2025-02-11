import React from "react";

interface LayoutProps {
  name: string; 
  children: React.ReactNode;
}
function BasePropertyWrapper({ name, children }: LayoutProps) {
  return (
    <div className="flex flex-column flex-justify-between height-100 padding-1">
      <div className="text-5 text-bold padding-b-1">{name} Settings</div>
      {children}
    </div>
  );
}

export default BasePropertyWrapper;
