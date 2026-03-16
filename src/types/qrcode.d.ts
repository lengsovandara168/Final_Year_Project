declare module "qrcode" {
  type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  type ToDataUrlOptions = {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: ErrorCorrectionLevel;
    color?: {
      dark?: string;
      light?: string;
    };
  };

  const QRCode: {
    toDataURL(value: string, options?: ToDataUrlOptions): Promise<string>;
  };

  export default QRCode;
}
