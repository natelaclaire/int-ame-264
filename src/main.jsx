import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import LearningOutcomes from './pages/LearningOutcomes'
import OutcomeResources from './pages/OutcomeResources'
import Modules from './pages/Modules'
import Module from './pages/Module'
import './styles.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'learning-outcomes', element: <LearningOutcomes /> },
      { path: 'learning-outcomes/:id', element: <OutcomeResources /> },
      { path: 'modules', element: <Modules /> },
      { path: 'modules/:slug', element: <Module /> }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
