import LoginPage from "./LoginPage";
import Admin from "./Admin"
import { useAuth0 } from "@auth0/auth0-react";

function Home() {
    const { user, isAuthenticated, isLoading } = useAuth0();

    return (
        <div className="bg-slate-900 flex items-center justify-center">
            {isAuthenticated ? <Admin /> : <LoginPage />}
        </div>
    )
}

export default Home;