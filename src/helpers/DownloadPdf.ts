"use client";

export const downloadPdf = async (payload: any) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/download/pdf/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/pdf"
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
        console.log(res)
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const blob = await res.blob();
    
    // Verify it's a PDF
    if (blob.type !== "application/pdf") {
      console.error("Received non-PDF response:", blob.type);
      const text = await blob.text();
      console.error("Response text:", text);
      throw new Error("Server did not return a PDF");
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${payload.type}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error:any) {
    console.error("Download failed:", error);
    alert(`Failed to download PDF: ${error.message}`);
  }
};