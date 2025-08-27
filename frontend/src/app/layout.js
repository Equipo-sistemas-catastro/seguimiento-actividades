import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Seguimiento Actividades",
  description: "App Seguimiento Actividades",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
