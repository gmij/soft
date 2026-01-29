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
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        // Call API to create GitHub issue automatically
        const response = await fetch('/api/submit-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            softwareName: values.softwareName,
            additionalInfo: values.additionalInfo,
            language: i18n.language === 'en' ? 'en' : 'zh-CN'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit request');
        }

        // Show success status
        setSubmitStatus('success');
        message.success(t('request.submitSuccess'));
        
        // Reset form after short delay
        setTimeout(() => {
          form.resetFields();
          setSubmitStatus('idle');
          onClose();
        }, 5000);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(
            i18n.language === 'en' 
              ? 'Request timeout. Please try again.' 
              : '请求超时，请重试。'
          );
        }
        throw fetchError;
      }
      
    } catch (error) {
      console.error('Failed to submit request:', error);
      setSubmitStatus('error');
      message.error(error instanceof Error ? error.message : t('request.submitError'));
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
