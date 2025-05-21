import { Route, Routes } from "react-router-dom"
import { routes } from "./router-config"
import ProtectedRoutes from "./components/auth/protected-routes/protected-routes"
import { Dashboard, Config, Noticias} from "../src/pages"


export const AppRouter = () => {
  return (
    <div>
      <Routes>
        {/* Rutas Publicas */}
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/config" element={<Config />} />
            <Route path="/noticias" element={<Noticias />} />
            {/* Puedes añadir más rutas protegidas aquí */}
          </Route>
      </Routes>
    </div>
  )
}