import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy/rarely-changing vendor libs into their own chunks so
        // the browser can cache them separately from app code, and the
        // initial JS payload isn't one single multi-MB bundle.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          pdf: ["jspdf", "html2canvas-pro"],
          calendar: [
            "@fullcalendar/core",
            "@fullcalendar/daygrid",
            "@fullcalendar/interaction",
            "@fullcalendar/react",
            "react-calendar",
            "react-multi-date-picker",
          ],
        },
      },
    },
  },
})
