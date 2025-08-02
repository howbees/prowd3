// components/LogoutButton.js
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useRouter } from "next/router";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button onClick={handleLogout} style={{ }}>
      Logout
    </button>
  );
}
