import LoginButton from "../auth/login";
import Admin from "./Admin"
import { useAuth0 } from "@auth0/auth0-react";

function Home() {
    const { user, isAuthenticated, isLoading } = useAuth0();

    return (
        <div>
            {isAuthenticated ? <Admin /> : <LoginButton />}
        </div>
    )
}

export default Home;