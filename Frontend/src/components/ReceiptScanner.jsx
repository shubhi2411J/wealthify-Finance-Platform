import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const ReceiptScanner = ({ onScanComplete }) => {
  const [loading, setLoading] = useState(false);
  const REACT_APP_BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL;
  const [scannedData, setScannedData] = useState(null);
  
  const fileInputRef = useRef();

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB",{position: "top-center", });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    sendFormData(formData);
  };

  const sendFormData = async (formData) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${REACT_APP_BACKEND_URL}/transaction/scan-receipt`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(Object.values(response.data).includes(null)){
        toast.error("Error while scanning",{position: "top-center", });
        return;
      }
      setScannedData(response.data);
      toast.success("Scanned successfully",{position: "top-center", });
    } catch (error) {
      toast.error("Error while scanning",{position: "top-center", });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scannedData) {
      onScanComplete(scannedData);
   
    }
  }, [scannedData]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleReceiptScan(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ReceiptScanner;
