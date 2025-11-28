import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Card,
  Tag,
  Button,
  Spin,
  Empty,
  Collapse,
  List,
  Space,
  Breadcrumb,
  message,
} from 'antd';
import {
  DownloadOutlined,
  CloudOutlined,
  CopyOutlined,
  HomeOutlined,
  FileOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Software, SoftwareData, SoftwareVersion } from '../types';
import { fetchSoftwareData } from '../utils';

const { Title, Paragraph, Text } = Typography;

const SoftwareDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [loading, setLoading] = useState(true);
  const [software, setSoftware] = useState<Software | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    fetchSoftwareData()
      .then((data: SoftwareData) => {
        const found = data.software.find(
          (s) => s.name === decodeURIComponent(name)
        );
        if (found) {
          setSoftware(found);
        } else {
          setError('未找到该软件');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load software data:', err);
        setError('加载数据失败');
        setLoading(false);
      });
  }, [name]);

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      message.success('链接已复制到剪贴板');
    } catch {
      message.error('复制失败，请手动复制');
    }
  };

  const getDownloadUrl = (softwareName: string, version: string, fileName: string) => {
    return `${import.meta.env.BASE_URL}down/${encodeURIComponent(softwareName)}/${encodeURIComponent(version)}/${encodeURIComponent(fileName)}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16 }}>加载中...</Paragraph>
      </div>
    );
  }

  if (error || !software) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description={error || '未找到软件'} />
        <Link to="/">
          <Button type="primary" style={{ marginTop: 16 }}>
            返回首页
          </Button>
        </Link>
      </div>
    );
  }

  const renderVersionContent = (version: SoftwareVersion) => {
    if (version.downloadType === 'p2p' && version.p2pLink) {
      return (
        <div>
          <Paragraph>
            <Text type="secondary">P2P 下载地址：</Text>
          </Paragraph>
          <Card size="small" style={{ background: '#f5f5f5' }}>
            <Text code copyable={{ text: version.p2pLink }}>
              {version.p2pLink}
            </Text>
          </Card>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => handleCopyLink(version.p2pLink!)}
            style={{ marginTop: 12 }}
          >
            复制链接
          </Button>
        </div>
      );
    }

    if (version.files && version.files.length > 0) {
      return (
        <List
          size="small"
          dataSource={version.files}
          renderItem={(file) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  href={getDownloadUrl(software.name, version.version, file)}
                  target="_blank"
                  key="download"
                >
                  下载
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined style={{ fontSize: 20 }} />}
                title={file}
              />
            </List.Item>
          )}
        />
      );
    }

    return <Empty description="暂无下载文件" />;
  };

  const collapseItems = software.versions.map((version, index) => ({
    key: version.version,
    label: (
      <Space>
        <Text strong>{version.version}</Text>
        <Tag
          icon={version.downloadType === 'p2p' ? <CloudOutlined /> : <DownloadOutlined />}
          color={version.downloadType === 'p2p' ? 'orange' : 'green'}
        >
          {version.downloadType === 'p2p' ? 'P2P 下载' : '直接下载'}
        </Tag>
        {index === 0 && <Tag color="blue">最新版本</Tag>}
      </Space>
    ),
    children: (
      <div>
        {version.description && (
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>版本说明</Title>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {version.description}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <Title level={5}>下载</Title>
        {renderVersionContent(version)}
      </div>
    ),
  }));

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            href: import.meta.env.BASE_URL,
            title: (
              <>
                <HomeOutlined />
                <span>首页</span>
              </>
            ),
          },
          {
            title: software.name,
          },
        ]}
      />

      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          {software.name}
        </Title>
        {software.description ? (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {software.description}
            </ReactMarkdown>
          </div>
        ) : (
          <Paragraph type="secondary">暂无描述</Paragraph>
        )}
      </Card>

      <Title level={4} style={{ marginBottom: 16 }}>
        版本列表 ({software.versions.length} 个版本)
      </Title>

      <Collapse
        defaultActiveKey={[software.versions[0]?.version]}
        items={collapseItems}
      />
    </div>
  );
};

export default SoftwareDetailPage;
