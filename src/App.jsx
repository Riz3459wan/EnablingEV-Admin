import { AuthProvider } from "./auth/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
