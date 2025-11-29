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
  Row,
  Col,
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
import { useTranslation } from 'react-i18next';
import type { Software, SoftwareData, SoftwareVersion, TagType, LocalizedDescription } from '../types';
import { TAG_COLORS } from '../types';
import { fetchSoftwareData } from '../utils';

const { Title, Paragraph, Text } = Typography;

/**
 * Get the description for the current language
 * Falls back to any available language if the preferred language is not available
 */
function getLocalizedDescription(
  descriptions: LocalizedDescription | undefined,
  legacyDescription: string | undefined,
  language: string
): string | undefined {
  // If we have multilingual descriptions, use them
  if (descriptions) {
    // Map i18next language code to our keys
    const langKey = language === 'en' ? 'en' : 'zh-CN';
    const fallbackKey = language === 'en' ? 'zh-CN' : 'en';
    
    // Try preferred language first, then fallback
    return descriptions[langKey] || descriptions[fallbackKey] || legacyDescription;
  }
  
  // Fall back to legacy single description
  return legacyDescription;
}

const SoftwareDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
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
          setError(t('common.notFound'));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load software data:', err);
        setError(t('common.loadError'));
        setLoading(false);
      });
  }, [name, t]);

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      message.success(t('common.copySuccess'));
    } catch {
      message.error(t('common.copyFailed'));
    }
  };

  const getDownloadUrl = (softwareName: string, version: string, fileName: string) => {
    return `${import.meta.env.BASE_URL}down/${encodeURIComponent(softwareName)}/${encodeURIComponent(version)}/${encodeURIComponent(fileName)}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16 }}>{t('common.loading')}</Paragraph>
      </div>
    );
  }

  if (error || !software) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description={error || t('common.notFound')} />
        <Link to="/">
          <Button type="primary" style={{ marginTop: 16 }}>
            {t('common.backToHome')}
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
            <Text type="secondary">{t('common.p2pAddress')}</Text>
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
            {t('common.copyLink')}
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
                  {t('common.download')}
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

    return <Empty description={t('common.noDownloadFiles')} />;
  };

  const collapseItems = software.versions.map((version, index) => {
    const versionDescription = getLocalizedDescription(
      version.descriptions,
      version.description,
      i18n.language
    );
    
    return {
      key: version.version,
      label: (
        <Space>
          <Text strong>{version.version}</Text>
          <Tag
            icon={version.downloadType === 'p2p' ? <CloudOutlined /> : <DownloadOutlined />}
            color={version.downloadType === 'p2p' ? 'orange' : 'green'}
          >
            {version.downloadType === 'p2p' ? t('common.p2pDownload') : t('common.directDownload')}
          </Tag>
          {index === 0 && <Tag color="blue">{t('common.latestVersion')}</Tag>}
        </Space>
      ),
      children: (
        <div>
          {versionDescription && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>{t('common.versionNotes')}</Title>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {versionDescription}
                </ReactMarkdown>
              </div>
            </div>
          )}
          <Title level={5}>{t('common.download')}</Title>
          {renderVersionContent(version)}
        </div>
      ),
    };
  });

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
                <span>{t('common.home')}</span>
              </>
            ),
          },
          {
            title: software.name,
          },
        ]}
      />

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={18}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {software.name}
            </Title>
            {/* 显示软件标签 */}
            {software.tags && software.tags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {software.tags.map((tag) => (
                  <Tag 
                    key={tag} 
                    color={TAG_COLORS[tag as TagType] || 'default'}
                    style={{ marginBottom: 4 }}
                  >
                    {t(`tags.${tag}`, { defaultValue: tag })}
                  </Tag>
                ))}
              </div>
            )}
            {(() => {
              const softwareDescription = getLocalizedDescription(
                software.descriptions,
                software.description,
                i18n.language
              );
              return softwareDescription ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {softwareDescription}
                  </ReactMarkdown>
                </div>
              ) : (
                <Paragraph type="secondary">{t('common.noDescription')}</Paragraph>
              );
            })()}
          </Col>
          <Col xs={24} md={6}>
            {/* 下载最新版本按钮 */}
            {software.versions.length > 0 && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                padding: '16px 0',
                borderLeft: '1px solid var(--ant-color-border, #f0f0f0)',
                height: '100%',
                minHeight: 120
              }}>
                <Tag color="blue" style={{ marginBottom: 8 }}>
                  {software.versions[0].version}
                </Tag>
                <Text type="secondary" style={{ marginBottom: 12, textAlign: 'center' }}>
                  {t('common.latestVersion')}
                </Text>
                {software.versions[0].downloadType === 'p2p' && software.versions[0].p2pLink ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      const p2pLink = software.versions[0].p2pLink;
                      if (p2pLink) {
                        handleCopyLink(p2pLink);
                      }
                    }}
                  >
                    {t('common.copyLink')}
                  </Button>
                ) : software.versions[0].files?.[0] ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<DownloadOutlined />}
                    href={getDownloadUrl(software.name, software.versions[0].version, software.versions[0].files[0])}
                    target="_blank"
                  >
                    {t('detail.downloadLatest')}
                  </Button>
                ) : null}
              </div>
            )}
          </Col>
        </Row>
      </Card>

      <Title level={4} style={{ marginBottom: 16 }}>
        {t('detail.versionList')} {t('detail.versionCount', { count: software.versions.length })}
      </Title>

      <Collapse
        defaultActiveKey={software.versions.length > 0 ? [software.versions[0].version] : []}
        items={collapseItems}
      />
    </div>
  );
};

export default SoftwareDetailPage;
