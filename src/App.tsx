import { HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MainLayout } from './components';
import { HomePage, SoftwareDetailPage } from './pages';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AntApp>
        <HashRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/software/:name" element={<SoftwareDetailPage />} />
            </Routes>
          </MainLayout>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
