import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./components/landing-demo/Landing";
import SignUp from "./components/signUp-demo/SignUp";
import SignIn from "./components/signIn-demo/SignIn";
import Home from "./components/home-demo/Home";
import Register from "./components/register-demo/Register";
import Footer from "./components/Footer";
import Catalog from "./pages/Catalog";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
