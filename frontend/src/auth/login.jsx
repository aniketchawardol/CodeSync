import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="bg-blue-600 p-2 rounded-md"  onClick={() => loginWithRedirect()}>Log In</button>;
};

export default LoginButton;