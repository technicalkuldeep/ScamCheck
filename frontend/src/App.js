import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Landing from "@/pages/Landing";
import Results from "@/pages/Results";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/scan/:address" element={<Results />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#121216",
            border: "1px solid #27272A",
            borderRadius: 0,
            color: "#fff",
            fontFamily: "IBM Plex Mono, monospace",
          },
        }}
      />
    </div>
  );
}

export default App;
