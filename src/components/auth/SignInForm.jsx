import { useState } from "react";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      // Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cross-check UID with Clients collection
      const clientRef = doc(db, "DMs", user.uid);
      const clientDoc = await getDoc(clientRef);

      if (clientDoc.exists()) {
        // Client exists, proceed
        navigate("/campaigns"); // Redirect to dashboard
      } else {
        // Not a client, sign out user and show error
        setError("Access Denied: This account is not registered.");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Sign In Error:", error.message);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="auth-button" onClick={handleSignIn}>
          Sign In
        </button>
        <p className="auth-link">
          Don't have an account? <a href="/signup">Register</a>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
