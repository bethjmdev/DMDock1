import { createContext, useEffect, useState, useContext } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("authUser")) || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if user is a Trainer or Client
        const trainerRef = doc(db, "Trainers", currentUser.uid);
        const trainerDoc = await getDoc(trainerRef);

        if (trainerDoc.exists()) {
          const trainerUser = { ...currentUser, role: "Trainer" };
          setUser(trainerUser);
          localStorage.setItem("authUser", JSON.stringify(trainerUser));
        } else {
          const clientRef = doc(db, "Clients", currentUser.uid);
          const clientDoc = await getDoc(clientRef);

          if (clientDoc.exists()) {
            const clientUser = { ...currentUser, role: "Client" };
            setUser(clientUser);
            localStorage.setItem("authUser", JSON.stringify(clientUser));
          } else {
            // If user is not in either collection, sign them out
            await signOut(auth);
            setUser(null);
            localStorage.removeItem("authUser");
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem("authUser");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
