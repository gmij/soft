import { Layout, Typography, theme, Space } from 'antd';
import { GithubOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

const { Header, Content, Footer } = Layout;
const { Title, Link: AntLink } = Typography;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <a href={import.meta.env.BASE_URL} style={{ textDecoration: 'none' }}>
          <Title
            level={3}
            style={{ color: '#fff', margin: 0, cursor: 'pointer' }}
          >
            📦 {t('common.siteName')}
          </Title>
        </a>
        <Space size="middle">
          <AntLink
            href={`${import.meta.env.BASE_URL}#/about`}
            style={{ color: '#fff', fontSize: 14 }}
          >
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            {t('common.about')}
          </AntLink>
          <LanguageSwitcher />
          <AntLink
            href="https://github.com/gmij/soft"
            target="_blank"
            style={{ color: '#fff', fontSize: 24 }}
          >
            <GithubOutlined />
          </AntLink>
        </Space>
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 'calc(100vh - 200px)',
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </Footer>
    </Layout>
  );
};

export default MainLayout;
