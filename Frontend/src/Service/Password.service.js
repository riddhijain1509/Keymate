import { toast } from 'react-hot-toast';
import {
    decryptVaultPayload,
    encryptVaultPayload,
    importDEKFromJwk,
} from "./VaultCrypto.service.js";

const backendURL = import.meta.env?.VITE_BACKEND_URL;

export const getAllPasswords_Service = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${backendURL}/password/allpasswords`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.status === 200)return data.data;
      else return [];
    } 
    catch
    {
      toast.error('Failed to Load Passwords');
      return [];
    }
};

export const addPassword_Service = async ({username,websiteName,websiteURL,email,password}, vaultKeyJwk) => {
    try {
        if (!vaultKeyJwk) throw new Error("Vault is locked");
        const token = localStorage.getItem('accessToken');
        const dek = await importDEKFromJwk(vaultKeyJwk);
        const encryptedPayload = await encryptVaultPayload({ username, email, password }, dek);
        const response = await fetch(`${backendURL}/password/addpassword`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                websiteName,
                websiteURL,
                ciphertext: encryptedPayload.ciphertext,
                iv: encryptedPayload.iv,
                version: encryptedPayload.version,
            }),
        });
        
        if (response?.status === 201) 
        {
            toast.success("Password Added");
            return true;
        }
        else 
        {
            const data = await response.json();
            toast.error(data?.message || "Adding Password failed")
            return false;
        }
    } catch (_error) {
        toast.error(_error.message || 'Server Error');
        console.error(_error);
        return false;
}
};

export const get_A_Password_Service = async (id, vaultKeyJwk) => {
    try {
        if (!vaultKeyJwk) throw new Error("Vault is locked");
        const token = localStorage.getItem('accessToken');
        const dek = await importDEKFromJwk(vaultKeyJwk);
        const response = await fetch(`${backendURL}/password/getpassword/${id}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status !== 200) {
            toast.error("Error fetching Password");
            return null;
        }

        const decrypted = await decryptVaultPayload(data.data, dek);

        return {
            _id: data.data._id,
            websiteName: data.data.websiteName,
            websiteURL: data.data.websiteURL,
            username: decrypted.username,
            email: decrypted.email,
            password: decrypted.password,
        };
    } catch (_error) {
        toast.error(_error.message || 'Server Error');
        return false;
    }
};

export const updatePassword_Service = async (userData, vaultKeyJwk) => {
    try {
  
        if (!vaultKeyJwk) throw new Error("Vault is locked");
  
        const token = localStorage.getItem('accessToken');
        const {password,username,websiteName,websiteURL,email,id}=userData;
        const dek = await importDEKFromJwk(vaultKeyJwk);
        const encryptedPayload = await encryptVaultPayload(
            { username, email, password },
            dek
        );


        const response = await fetch(`${backendURL}/password/updatePassword/${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                websiteName,
                websiteURL,
                ciphertext: encryptedPayload.ciphertext,
                iv: encryptedPayload.iv,
                version: encryptedPayload.version,
            }),
        });
        

        if (response?.status === 201 || response?.status === 200) 
        {
            const updatedData = await response.json();
            toast.success("Updated Successfully");
            return updatedData;
        }
        else 
        {
            const data = await response.json();
            toast.error(data?.message || "Updating Password failed")
            return false;
        }
    } catch (_error) {
        toast.error(_error.message || 'Server Error');
        console.error("Request failed:", _error);
        return false;
}
};

export const delete_A_Password_Service = async (id) => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${backendURL}/password/deletePassword/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            toast.success("Password deleted successfully");
            return data;
        }

        toast.error(data?.message || "Error deleting password");
        return null;
    } catch {
        toast.error("Server Error");
        return null;
    }
};

