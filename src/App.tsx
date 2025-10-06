import "react-phone-input-2/lib/style.css";
import { Route, Routes } from "react-router-dom";
import Cart from "./Pages/Cart/Cart";
import Layout from "./Layouts/DefaultLayout";
// import About from "./Pages/About";
import Appointment from "./Pages/Appointment";
import Home from "./Pages/Home";

function App() {
  return (
    <div>
      {/* <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav> */}

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/Appointment" element={<Appointment />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
