import { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Components/Auth/Login.jsx';
import Register from './Components/Auth/Register.jsx';
import FrogotPassword from './Components/Auth/FrogotPassword.jsx';
import SetNewPassword from './Components/Auth/SetNewPassword.jsx';
import Home from './Components/Home/Home.jsx';
import Profile from './Components/Profile/Profile.jsx'
import AllPassword from './Components/Password/AllPassword.jsx';
import AddPassword from './Components/Password/AddPassword.jsx';
import PasswordDetail from './Components/PasswordDetail/PasswordDetail.jsx';
import PrivateKey from './Components/PrivateKey/PrivateKey.jsx';
import VaultGate from './Components/VaultGate.jsx';
import { checkisloggedIn } from './Service/Auth.service.js';
import { clearVaultState, setVaultMeta } from './Features/todoslice.js';
import { fetchVaultMetaService } from './Service/VaultBootstrap.service.js';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const bootstrapVault = async () => {
      if (!checkisloggedIn()) {
        dispatch(clearVaultState());
        return;
      }

      try {
        const metaResponse = await fetchVaultMetaService();
        dispatch(setVaultMeta(metaResponse?.vaultKeyMeta ?? null));
      } catch {
        dispatch(setVaultMeta(null));
      }
    };

    bootstrapVault();
  }, [dispatch, location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<FrogotPassword/>} />
      <Route path="/" element={<Home/>} />
      <Route path="/setpassword/:token" element={<SetNewPassword />} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/passwords" element={<VaultGate><AllPassword /></VaultGate>} />
      <Route path="/add_password" element={<VaultGate><AddPassword/></VaultGate>} />
      <Route path="/passwords/:id" element={<VaultGate><PasswordDetail /></VaultGate>} />
      <Route path="/keys" element={<PrivateKey />} />
    </Routes>
  );
}

export default App
