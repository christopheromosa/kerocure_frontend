import Image from "next/image";
import React from "react";

const OrganizationInfo = () => {
  return (
    <div className="flex items-center justify-between border-b pb-4 mb-6">
      <div className="flex-shrink-0">
        <Image
          src="/kerocureLogo-removebg-preview.png" // Ensure the image is inside the public folder
          alt="Company Logo"
          width={200} // Set width
          height={100} // Set height
          priority // Load it as a high priority
        />
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold">KEROCURE MEDICAL CENTER</h2>
        <p>PO BOX: 3172 - 4255, KISII</p>
        <p>Email: Kerocure1@gmail.com</p>
        <p>Tel: +254711111111</p>
      </div>
    </div>
  );
};

export default OrganizationInfo;
