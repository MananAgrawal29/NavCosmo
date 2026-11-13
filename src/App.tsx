import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import WorkspacePage from './pages/WorkspacePage'
import DataSourcesPage from './pages/DataSourcesPage'
import AboutPage from './pages/AboutPage'
import OverviewPage from './pages/OverviewPage'
import ExplorerPage from './pages/ExplorerPage'
import AnalysisPage from './pages/AnalysisPage'
import SimulatorPage from './pages/SimulatorPage'
import ComparisonPage from './pages/ComparisonPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/workspace" replace />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/sources" element={<DataSourcesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}