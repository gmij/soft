import { Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { saveLanguage } from '../i18n';

const languages = [
  { key: 'zh-CN', label: '简体中文' },
  { key: 'en', label: 'English' },
];

// 默认使用第一个语言作为回退
const DEFAULT_LANGUAGE = languages[0];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange: MenuProps['onClick'] = ({ key }) => {
    i18n.changeLanguage(key);
    saveLanguage(key);
  };

  const items: MenuProps['items'] = languages.map((lang) => ({
    key: lang.key,
    label: lang.label,
  }));

  const currentLang = languages.find((l) => l.key === i18n.language)?.label || DEFAULT_LANGUAGE.label;

  return (
    <Dropdown
      menu={{ items, onClick: handleLanguageChange, selectedKeys: [i18n.language] }}
      placement="bottomRight"
    >
      <span style={{ color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <GlobalOutlined style={{ fontSize: 18 }} />
        <span style={{ fontSize: 14 }}>{currentLang}</span>
      </span>
    </Dropdown>
  );
};

export default LanguageSwitcher;
