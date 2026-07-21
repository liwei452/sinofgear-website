import { createBrowserRouter } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { WorkbenchLayout } from '../layout/WorkbenchLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { ProjectListPage } from '../pages/ProjectListPage'
import { ProjectOverviewPage } from '../pages/ProjectOverviewPage'
import { ProjectFilesPage } from '../pages/ProjectFilesPage'
import { CapabilityReviewPage } from '../pages/CapabilityReviewPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <WorkbenchLayout />,
      children: [
        { path: '/', element: <DashboardPage /> },
        { path: '/projects', element: <ProjectListPage /> },
        { path: '/projects/:projectId', element: <ProjectOverviewPage /> },
        { path: '/projects/:projectId/files', element: <ProjectFilesPage /> },
        { path: '/projects/:projectId/capabilities', element: <CapabilityReviewPage /> },
      ],
    }],
  },
])
