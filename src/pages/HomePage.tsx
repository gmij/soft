import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Empty, Spin, Tag, Space } from 'antd';
import { AppstoreOutlined, DownloadOutlined, CloudOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Software, SoftwareData, TagType } from '../types';
import { TAG_COLORS } from '../types';
import { fetchSoftwareData } from '../utils';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  // 获取当前选中标签的翻译名称
  const getSelectedTagName = () => {
    if (!selectedTag) return '';
    return t(`tags.${selectedTag}`, { defaultValue: selectedTag });
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

      {/* 标签筛选 */}
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

      {/* 分类下没有软件的提示 */}
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
                    
                    {/* 软件标签 */}
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
                      {software.description || t('common.noDescription')}
                    </Paragraph>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color="blue">
                        {latestVersion?.version || t('common.unknownVersion')}
                      </Tag>
                      <Tag
                        icon={downloadType === 'p2p' ? <CloudOutlined /> : <DownloadOutlined />}
                        color={downloadType === 'p2p' ? 'orange' : 'green'}
                      >
                        {downloadType === 'p2p' ? t('common.p2p') : t('common.directDownload')}
                      </Tag>
                    </div>
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default HomePage;
