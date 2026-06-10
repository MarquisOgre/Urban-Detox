import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Smartphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";

const DownloadPdf = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const o = window.location.origin;
    setOrigin(o);
    setPdfUrl(`${o}/Urban%20Detox%20-%20Benefits%20&%20Diet.pdf`);
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Urban%20Detox%20-%20Benefits%20&%20Diet.pdf";
    link.download = "Urban Detox - Benefits & Diet.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PromoBanner />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="text-center space-y-2">
            
<CardTitle className="text-2xl font-bold flex flex-col items-center text-center">
  <img
    src="/UrbanDetox-Logo.png"
    alt="Urban Detox"
    className="h-12 mb-2"
  />
  <span>Benefits & Diet Plans</span>
</CardTitle>
            <p className="text-muted-foreground text-sm">
              Scan the QR code with your phone to download the PDF
            </p>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6">
            {/* QR Code */}
            {pdfUrl && (
              <div className="bg-white p-4 rounded-xl shadow-inner border">
                <QRCodeSVG
                  value={pdfUrl}
                  size={240}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.png",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
            )}

            {/* Scan Instructions */}
            <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg w-full">
              <Smartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">How to download</p>
                <p>1. Open your phone camera or QR scanner app</p>
                <p>2. Point it at the QR code above</p>
                <p>3. Tap the link that appears — the PDF will open and download automatically</p>
              </div>
            </div>

            {/* Direct Download Button */}
            <Button
              onClick={handleDownload}
              className="w-full gap-2"
              size="lg"
            >
              <Download className="w-5 h-5" />
              Download PDF on this device
            </Button>

            {/* PDF URL (for copy/paste) */}
            {origin && (
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-1 text-center">
                  Or visit this link directly:
                </p>
                <div className="bg-muted rounded-md px-3 py-2 text-xs text-center break-all font-mono">
                  {origin}/Urban Detox - Benefits & Diet.pdf
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadPdf;
