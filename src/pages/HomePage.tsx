import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Empty, Spin, Tag, Space, Button, message } from 'antd';
import { AppstoreOutlined, DownloadOutlined, CloudOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Software, SoftwareData, TagType } from '../types';
import { TAG_COLORS } from '../types';
import { fetchSoftwareData, stripMarkdown, getLocalizedDescription, triggerDownload, updatePageMeta } from '../utils';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Update SEO meta tags when language changes
  useEffect(() => {
    const isEnglish = i18n.language === 'en';
    updatePageMeta({
      title: isEnglish 
        ? 'Software Download - Safe & Reliable Software Download Platform'
        : '软件下载站 - 安全可靠的软件下载平台',
      description: isEnglish
        ? 'Download safe and free software including system tools, development tools, office applications. Fast, secure, ad-free.'
        : '提供常用软件的安全下载服务，包括系统工具、开发工具、办公软件等。免费、快速、无广告。',
      keywords: isEnglish
        ? 'software download,free software,system tools,development tools,office software'
        : '软件下载,免费软件,系统工具,开发工具,办公软件,装机必备,绿色软件',
      canonicalPath: ''
    });
  }, [i18n.language]);

  useEffect(() => {
    fetchSoftwareData()
      .then((data: SoftwareData) => {
        setSoftwareList(data.software);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load software data:', err);
        setError(t('common.loadError'));
        setLoading(false);
      });
  }, [t]);

  // 收集所有唯一的标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    softwareList.forEach((software) => {
      software.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [softwareList]);

  // 根据选中的标签过滤软件列表
  const filteredSoftwareList = useMemo(() => {
    if (!selectedTag) return softwareList;
    return softwareList.filter((software) => software.tags?.includes(selectedTag));
  }, [softwareList, selectedTag]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16 }}>{t('common.loading')}</Paragraph>
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
        <Empty 
          description={
            <div>
              <div>{t('common.noData')}</div>
              <div style={{ marginTop: 8, color: '#888' }}>{t('common.noDataHint')}</div>
            </div>
          } 
        />
      </div>
    );
  }

  // Get translated name of currently selected tag
  const getSelectedTagName = () => {
    if (!selectedTag) return '';
    return t(`tags.${selectedTag}`, { defaultValue: selectedTag });
  };

  // Handle copy P2P link
  const handleCopyLink = async (link: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(link);
      message.success(t('common.copySuccess'));
    } catch {
      message.error(t('common.copyFailed'));
    }
  };

  // Get download URL for direct download
  const getDownloadUrl = (softwareName: string, version: string, fileName: string) => {
    return `${import.meta.env.BASE_URL}down/${encodeURIComponent(softwareName)}/${encodeURIComponent(version)}/${encodeURIComponent(fileName)}`;
  };

  // Helper function to get download type icon, color, and label
  const getDownloadTypeInfo = (downloadType: string) => {
    switch (downloadType) {
      case 'p2p':
        return { icon: <CloudOutlined />, color: 'orange', label: t('common.p2pDownload') };
      case 'official':
        return { icon: <LinkOutlined />, color: 'purple', label: t('common.officialDownload') };
      default:
        return { icon: <DownloadOutlined />, color: 'green', label: t('common.directDownload') };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          {t('home.title')}
        </Title>
        <Paragraph type="secondary">
          {t('home.softwareCount', { count: filteredSoftwareList.length })}
        </Paragraph>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ marginRight: 8 }}>{t('home.filterByTag')}:</Text>
          <Space wrap>
            <Tag
              color={selectedTag === null ? 'blue' : 'default'}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedTag(null)}
            >
              {t('home.allCategories')}
            </Tag>
            {allTags.map((tag) => (
              <Tag
                key={tag}
                color={selectedTag === tag ? TAG_COLORS[tag as TagType] || 'blue' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedTag(tag)}
              >
                {t(`tags.${tag}`, { defaultValue: tag })}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {/* Empty state when no software in selected category */}
      {filteredSoftwareList.length === 0 && selectedTag && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Empty
            description={
              <div>
                <div>{t('common.noCategoryData')}</div>
                <div style={{ marginTop: 8, color: '#888' }}>
                  {t('common.noCategoryDataHint', { category: getSelectedTagName() })}
                </div>
              </div>
            }
          />
        </div>
      )}

      {filteredSoftwareList.length > 0 && (
        <Row gutter={[16, 16]}>
          {filteredSoftwareList.map((software) => {
            const latestVersion = software.versions[0];
            const downloadType = latestVersion?.downloadType;
            const downloadTypeInfo = getDownloadTypeInfo(downloadType || 'direct');

            // Handle card click navigation
            const handleCardClick = () => {
              navigate(`/software/${encodeURIComponent(software.name)}`);
            };

            // Handle download button click
            const handleDownloadClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (latestVersion.files && latestVersion.files.length > 0) {
                triggerDownload(getDownloadUrl(software.name, latestVersion.version, latestVersion.files[0]));
              }
            };

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={software.name}>
                <Card
                  hoverable
                  className="software-card"
                  styles={{ body: { padding: '16px' } }}
                  onClick={handleCardClick}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {software.name}
                    </Text>
                  </div>
                  
                  {/* Software tags */}
                  {software.tags && software.tags.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
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
                  
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 12, minHeight: 44 }}
                  >
                    {(() => {
                      // Use localized description, falling back to legacy description
                      const description = getLocalizedDescription(
                        software.descriptions || latestVersion?.descriptions,
                        software.description || latestVersion?.description,
                        i18n.language
                      );
                      return description ? stripMarkdown(description) : t('common.noDescription');
                    })()}
                  </Paragraph>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Tag color="blue">
                      {latestVersion?.version || t('common.unknownVersion')}
                    </Tag>
                    <Tag
                      icon={downloadTypeInfo.icon}
                      color={downloadTypeInfo.color}
                    >
                      {downloadTypeInfo.label}
                    </Tag>
                  </div>

                  {/* Download button */}
                  {latestVersion && (
                    <div style={{ textAlign: 'center' }}>
                      {downloadType === 'official' && latestVersion.officialLink ? (
                        <Button
                          type="primary"
                          icon={<LinkOutlined />}
                          href={latestVersion.officialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          block
                        >
                          {t('common.goToOfficialSite')}
                        </Button>
                      ) : downloadType === 'p2p' && latestVersion.p2pLink ? (
                        <Button
                          type="primary"
                          icon={<CopyOutlined />}
                          onClick={(e) => handleCopyLink(latestVersion.p2pLink!, e)}
                          block
                        >
                          {t('common.copyLink')}
                        </Button>
                      ) : latestVersion.files && latestVersion.files.length > 0 ? (
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={handleDownloadClick}
                          block
                        >
                          {t('common.download')}
                        </Button>
                      ) : null}
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default HomePage;
