// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header"; // 대문자 H 확인
import Home from "./pages/Home";
import Game from "./pages/Game"; // Tournament가 Game이 됨
import Rank from "./pages/Rank"; // (나중에 만드시면 주석 해제)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/rank" element={<Rank />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
