import type { NextConfig } from "next";

const nextConfig: NextConfig = {
output: "export", // 👈 reemplaza el "next export"
  images: {
    unoptimized: true, // GitHub Pages no soporta optimización de imágenes
  },
//  basePath: "/time2go", // 👈 nombre de tu repo en GitHub
// assetPrefix: "/time2go/",
};

export default nextConfig;
