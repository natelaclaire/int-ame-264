import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import LearningOutcomes from './pages/LearningOutcomes'
import OutcomeResources from './pages/OutcomeResources'
import Modules from './pages/Modules'
import Module from './pages/Module'
import Assignments from './pages/Assignments'
import Assignment from './pages/Assignment'
import Syllabi from './pages/Syllabi'
import Syllabus from './pages/Syllabus'
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
      { path: 'modules/:slug', element: <Module /> },
      { path: 'assignments', element: <Assignments /> },
      { path: 'assignments/:slug', element: <Assignment /> },
      { path: 'assignments/:slug/:supplemental', element: <Assignment /> },
      { path: 'syllabi', element: <Syllabi /> },
      { path: 'syllabi/:slug', element: <Syllabus /> }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
