/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { checkisloggedIn } from "../Service/Auth.service.js";
import Loading from "./Loading/Loading.jsx";

const VaultGate = ({ children }) => {
  const vaultMetaLoaded = useSelector((state) => state.vaultMetaLoaded);
  const vaultReady = useSelector((state) => state.vaultReady);

  if (!checkisloggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (!vaultMetaLoaded) {
    return <Loading />;
  }

  if (!vaultReady) {
    return <Navigate to="/keys" replace />;
  }

  return children;
};

export default VaultGate;
