import { HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { MainLayout } from './components';
import { HomePage, SoftwareDetailPage } from './pages';
import './i18n';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  
  // 根据当前语言选择 antd 的 locale
  const antdLocale = i18n.language === 'en' ? enUS : zhCN;

  return (
    <ConfigProvider locale={antdLocale}>
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
