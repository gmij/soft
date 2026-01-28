import { useState } from 'react';
import { Modal, Form, Input, Button, Steps, Typography, Alert, Space, message } from 'antd';
import { MessageOutlined, RobotOutlined, CheckCircleOutlined, FileAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Paragraph, Text, Link } = Typography;

interface RequestSoftwareDialogProps {
  open: boolean;
  onClose: () => void;
}

const RequestSoftwareDialog: React.FC<RequestSoftwareDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Create GitHub issue URL with pre-filled content
      const issueTitle = `[软件申请] ${values.softwareName}`;
      const issueBody = `## 软件信息

**软件名称**: ${values.softwareName}

${values.additionalInfo ? `**补充说明**: ${values.additionalInfo}` : ''}

---

> 此申请由用户通过网站对话功能自动生成。
> 
> **处理流程**:
> 1. ✅ 申请已提交
> 2. 🤖 等待 GitHub Copilot Agent 自动搜索软件信息
> 3. 📝 Agent 将按照项目规则创建资源文件和描述
> 4. 👤 等待管理员审核
> 5. 🎉 审核通过后自动发布到网站

<!-- 
标签: software-request
不要手动编辑此 Issue，它将由 GitHub Actions 自动处理。
-->
`;

      // Construct GitHub issue URL
      const repoUrl = 'https://github.com/gmij/soft';
      const issueUrl = `${repoUrl}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=software-request`;
      
      // Open GitHub issue creation page
      window.open(issueUrl, '_blank');

      setSubmitStatus('success');
      message.success(t('request.submitSuccess'));
      
      // Reset form after short delay
      setTimeout(() => {
        form.resetFields();
        setSubmitStatus('idle');
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to submit request:', error);
      setSubmitStatus('error');
      message.error(t('request.submitError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSubmitStatus('idle');
    onClose();
  };

  const stepsItems = [
    {
      title: t('request.step1'),
      icon: <MessageOutlined />,
    },
    {
      title: t('request.step2'),
      icon: <RobotOutlined />,
    },
    {
      title: t('request.step3'),
      icon: <FileAddOutlined />,
    },
    {
      title: t('request.step4'),
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <Modal
      title={t('request.title')}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div style={{ marginBottom: 24 }}>
        <Paragraph type="secondary">
          {t('request.description')}
        </Paragraph>
      </div>

      {submitStatus === 'success' && (
        <Alert
          message={t('request.submitSuccess')}
          description={t('request.submitSuccessDesc')}
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {submitStatus === 'error' && (
        <Alert
          message={t('request.submitError')}
          description={
            <Space direction="vertical">
              <Text>{t('request.submitErrorDesc')}</Text>
              <Link href="https://github.com/gmij/soft/issues/new" target="_blank">
                {t('request.githubLinkText')}
              </Link>
            </Space>
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        disabled={loading || submitStatus === 'success'}
      >
        <Form.Item
          label={t('request.softwareNameLabel')}
          name="softwareName"
          rules={[{ required: true, message: t('request.softwareNameRequired') }]}
        >
          <Input
            placeholder={t('request.softwareNamePlaceholder')}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={t('request.additionalInfoLabel')}
          name="additionalInfo"
        >
          <TextArea
            placeholder={t('request.additionalInfoPlaceholder')}
            rows={4}
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 32, marginBottom: 24 }}>
        <Paragraph strong>{t('request.howItWorks')}</Paragraph>
        <Steps
          direction="vertical"
          size="small"
          items={stepsItems.map(item => ({
            ...item,
            status: 'wait' as const,
          }))}
        />
      </div>

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={handleCancel} disabled={loading}>
            {t('request.cancelButton')}
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={submitStatus === 'success'}
          >
            {loading ? t('request.submitting') : t('request.submitButton')}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default RequestSoftwareDialog;
