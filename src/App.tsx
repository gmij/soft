import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { MainLayout } from './components';
import { HomePage, SoftwareDetailPage, AboutPage } from './pages';
import './i18n';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  
  // 根据当前语言选择 antd 的 locale
  const antdLocale = i18n.language === 'en' ? enUS : zhCN;

  return (
    <ConfigProvider locale={antdLocale}>
      <AntApp>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/software/:name" element={<SoftwareDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
