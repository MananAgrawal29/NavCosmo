import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import OverviewPage from './pages/OverviewPage'
import ExplorerPage from './pages/ExplorerPage'
import AnalysisPage from './pages/AnalysisPage'
import ComparisonPage from './pages/ComparisonPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}