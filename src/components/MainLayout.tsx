import { Layout, Typography, theme } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

const { Header, Content, Footer } = Layout;
const { Title, Link: AntLink } = Typography;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
            📦 软件下载站
          </Title>
        </a>
        <AntLink
          href="https://github.com/gmij/soft"
          target="_blank"
          style={{ color: '#fff', fontSize: 24 }}
        >
          <GithubOutlined />
        </AntLink>
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
        软件下载站 ©{new Date().getFullYear()} Created with ❤️
      </Footer>
    </Layout>
  );
};

export default MainLayout;
