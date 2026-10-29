import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from "./auth/AuthContext";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

//Note StrictMode is something that is only used in development. It runs each render twice to ensure that the results from the components rendering is the same assuming no changes in state or props. It also checks if useEffect is cleaning after itself. BrowserRouter allows react-router to read the URL and it helps the browser stay on index.html so that visually things change but not the actual page, this prevents the browser from providing a brand new page and a white screen flash which was a thing in the past. AuthProvider is what checks logged on vs logged off state and determines if to initially direct users to login or myday page.