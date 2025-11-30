import { useEffect } from 'react';
import { Typography, Card, Row, Col, Divider } from 'antd';
import { InfoCircleOutlined, SafetyOutlined, CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { updatePageMeta } from '../utils';

const { Title, Paragraph } = Typography;

const AboutPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language === 'zh-CN' || i18n.language.startsWith('zh');

  // Update SEO meta tags when language changes
  useEffect(() => {
    const isEnglish = i18n.language === 'en';
    updatePageMeta({
      title: isEnglish 
        ? 'About - Software Download'
        : '关于本站 - 软件下载站',
      description: isEnglish
        ? 'Learn about our mission to provide clean, safe software downloads from official sources.'
        : '了解我们为何创建这个纯净、安全的软件下载平台。',
      keywords: isEnglish
        ? 'about,software download,clean software,safe download'
        : '关于我们,软件下载,纯净软件,安全下载,绿色软件',
      canonicalPath: '/about'
    });
  }, [i18n.language]);

  const features = [
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: t('about.feature1'),
      desc: t('about.feature1Desc'),
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: t('about.feature2'),
      desc: t('about.feature2Desc'),
    },
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: t('about.feature3'),
      desc: t('about.feature3Desc'),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          {t('about.title')}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          {t('about.subtitle')}
        </Paragraph>
      </div>

      <Card style={{ marginBottom: 24 }}>
        {/* IT Dilemma section - same for both languages */}
        <Title level={4}>{t('about.itDilemmaTitle')}</Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
          {t('about.itDilemmaContent')}
        </Paragraph>

        {/* Bloatware problem section - only show in Chinese (360 content) */}
        {isChinese && (
          <>
            <Divider />
            <Title level={4}>{t('about.bloatwareProblemTitle')}</Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
              {t('about.bloatwareProblemContent')}
            </Paragraph>
          </>
        )}

        <Divider />

        {/* Purpose section - same for both languages */}
        <Title level={4}>{t('about.purposeTitle')}</Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
          {t('about.purposeContent')}
        </Paragraph>

        <Divider />

        {/* Promise section - same for both languages */}
        <Title level={4}>{t('about.promiseTitle')}</Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
          {t('about.promiseContent')}
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              styles={{ body: { padding: '24px 16px' } }}
            >
              <div style={{ marginBottom: 16 }}>{feature.icon}</div>
              <Title level={5} style={{ marginBottom: 8 }}>
                {feature.title}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {feature.desc}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AboutPage;
