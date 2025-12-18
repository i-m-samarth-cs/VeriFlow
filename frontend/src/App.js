import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { BackgroundBoxesDemo } from "@/components/BackgroundBoxesDemo";
import { Navigation } from "@/components/Navigation";
import { WorkflowBuilder } from "@/components/WorkflowBuilder";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div>
      <BackgroundBoxesDemo />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workflows" element={<WorkflowBuilder />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
