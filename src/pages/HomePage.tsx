import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Empty, Spin, Tag } from 'antd';
import { AppstoreOutlined, DownloadOutlined, CloudOutlined } from '@ant-design/icons';
import type { Software, SoftwareData } from '../types';
import { fetchSoftwareData } from '../utils';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSoftwareData()
      .then((data: SoftwareData) => {
        setSoftwareList(data.software);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load software data:', err);
        setError('加载数据失败，请稍后重试');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16 }}>加载中...</Paragraph>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description={error} />
      </div>
    );
  }

  if (softwareList.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="暂无软件资源" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          软件资源列表
        </Title>
        <Paragraph type="secondary">
          共 {softwareList.length} 个软件可供下载
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {softwareList.map((software) => {
          const latestVersion = software.versions[0];
          const downloadType = latestVersion?.downloadType;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={software.name}>
              <Link to={`/software/${encodeURIComponent(software.name)}`}>
                <Card
                  hoverable
                  className="software-card"
                  styles={{ body: { padding: '16px' } }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {software.name}
                    </Text>
                  </div>
                  
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 12, minHeight: 44 }}
                  >
                    {software.description || '暂无描述'}
                  </Paragraph>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="blue">
                      {latestVersion?.version || '未知版本'}
                    </Tag>
                    <Tag
                      icon={downloadType === 'p2p' ? <CloudOutlined /> : <DownloadOutlined />}
                      color={downloadType === 'p2p' ? 'orange' : 'green'}
                    >
                      {downloadType === 'p2p' ? 'P2P' : '直接下载'}
                    </Tag>
                  </div>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default HomePage;
