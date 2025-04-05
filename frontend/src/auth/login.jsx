import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="bg-blue-600 px-5 py-2 mx-5 rounded-md text-lg"  onClick={() => loginWithRedirect()}>Log In</button>;
};

export default LoginButton;