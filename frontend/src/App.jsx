import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/notes" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/notes" element={<Notes />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;