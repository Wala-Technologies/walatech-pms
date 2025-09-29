'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  ColorPicker,
  Slider,
  Radio,
  Preview,
  message,
} from 'antd';
import {
  BgColorsOutlined,
  EyeOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  logoPosition: 'left' | 'center';
  sidebarStyle: 'light' | 'dark';
  headerStyle: 'light' | 'dark';
  borderRadius: number;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animationsEnabled: boolean;
  customCss?: string;
}

interface ThemeCustomizerProps {
  value?: Partial<ThemeSettings>;
  onChange?: (theme: Partial<ThemeSettings>) => void;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#1890ff',
  secondaryColor: '#52c41a',
  successColor: '#52c41a',
  warningColor: '#faad14',
  errorColor: '#ff4d4f',
  logoPosition: 'left',
  sidebarStyle: 'light',
  headerStyle: 'light',
  borderRadius: 6,
  fontSize: 'medium',
  compactMode: false,
  animationsEnabled: true,
};

export default function ThemeCustomizer({ value, onChange }: ThemeCustomizerProps) {
  const [theme, setTheme] = useState<ThemeSettings>({ ...defaultTheme, ...value });
  const [previewMode, setPreviewMode] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (value) {
      const updatedTheme = { ...defaultTheme, ...value };
      setTheme(updatedTheme);
      form.setFieldsValue(updatedTheme);
    }
  }, [value, form]);

  const handleThemeChange = (field: keyof ThemeSettings, newValue: any) => {
    const updatedTheme = { ...theme, [field]: newValue };
    setTheme(updatedTheme);
    onChange?.(updatedTheme);

    // Apply theme changes in real-time if preview mode is enabled
    if (previewMode) {
      applyThemePreview(updatedTheme);
    }
  };

  const applyThemePreview = (themeSettings: ThemeSettings) => {
    // Apply CSS custom properties for real-time preview
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    root.style.setProperty('--secondary-color', themeSettings.secondaryColor);
    root.style.setProperty('--success-color', themeSettings.successColor);
    root.style.setProperty('--warning-color', themeSettings.warningColor);
    root.style.setProperty('--error-color', themeSettings.errorColor);
    root.style.setProperty('--border-radius', `${themeSettings.borderRadius}px`);
    
    // Apply font size
    const fontSizeMap = {
      small: '12px',
      medium: '14px',
      large: '16px',
    };
    root.style.setProperty('--font-size-base', fontSizeMap[themeSettings.fontSize]);

    // Apply compact mode
    if (themeSettings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }

    // Apply animations
    if (!themeSettings.animationsEnabled) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    form.setFieldsValue(defaultTheme);
    onChange?.(defaultTheme);
    if (previewMode) {
      applyThemePreview(defaultTheme);
    }
    message.success('Theme reset to defaults');
  };

  const togglePreview = () => {
    const newPreviewMode = !previewMode;
    setPreviewMode(newPreviewMode);
    
    if (newPreviewMode) {
      applyThemePreview(theme);
      message.info('Preview mode enabled - changes will be applied in real-time');
    } else {
      // Reset to original theme
      const root = document.documentElement;
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--secondary-color');
      root.style.removeProperty('--success-color');
      root.style.removeProperty('--warning-color');
      root.style.removeProperty('--error-color');
      root.style.removeProperty('--border-radius');
      root.style.removeProperty('--font-size-base');
      document.body.classList.remove('compact-mode', 'no-animations');
      message.info('Preview mode disabled');
    }
  };

  const colorPresets = [
    { name: 'Default Blue', primary: '#1890ff', secondary: '#52c41a' },
    { name: 'Purple', primary: '#722ed1', secondary: '#13c2c2' },
    { name: 'Green', primary: '#52c41a', secondary: '#1890ff' },
    { name: 'Orange', primary: '#fa8c16', secondary: '#eb2f96' },
    { name: 'Red', primary: '#f5222d', secondary: '#faad14' },
    { name: 'Dark', primary: '#262626', secondary: '#595959' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <BgColorsOutlined style={{ marginRight: '8px' }} />
            Theme Customization
          </Title>
          <Text type="secondary">
            Customize the appearance and feel of your application
          </Text>
        </div>
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={togglePreview}
            type={previewMode ? 'primary' : 'default'}
          >
            {previewMode ? 'Disable Preview' : 'Enable Preview'}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={resetTheme}
          >
            Reset to Defaults
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={theme}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Color Scheme" size="small">
              <Form.Item label="Color Presets">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      size="small"
                      onClick={() => {
                        handleThemeChange('primaryColor', preset.primary);
                        handleThemeChange('secondaryColor', preset.secondary);
                        form.setFieldsValue({
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                        });
                      }}
                      style={{
                        background: `linear-gradient(45deg, ${preset.primary}, ${preset.secondary})`,
                        color: 'white',
                        border: 'none',
                      }}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Primary Color">
                    <ColorPicker
                      value={theme.primaryColor}
                      onChange={(color) => {
                        const hexColor = color.toHexString();
                        handleThemeChange('primaryColor', hexColor);
                        form.setFieldValue('primaryColor', hexColor);
                      }}
                      showText
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Secondary Color">
                    <ColorPicker
                      value={theme.secondaryColor}
                      onChange={(color) => {
                        const hexColor = color.toHexString();
                        handleThemeChange('secondaryColor', hexColor);
                        form.setFieldValue('secondaryColor', hexColor);
                      }}
                      showText
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Success Color">
                    <ColorPicker
                      value={theme.successColor}
                      onChange={(color) => {
                        const hexColor = color.toHexString();
                        handleThemeChange('successColor', hexColor);
                        form.setFieldValue('successColor', hexColor);
                      }}
                      showText
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Warning Color">
                    <ColorPicker
                      value={theme.warningColor}
                      onChange={(color) => {
                        const hexColor = color.toHexString();
                        handleThemeChange('warningColor', hexColor);
                        form.setFieldValue('warningColor', hexColor);
                      }}
                      showText
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Error Color">
                    <ColorPicker
                      value={theme.errorColor}
                      onChange={(color) => {
                        const hexColor = color.toHexString();
                        handleThemeChange('errorColor', hexColor);
                        form.setFieldValue('errorColor', hexColor);
                      }}
                      showText
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Layout & Styling" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Logo Position">
                    <Select
                      value={theme.logoPosition}
                      onChange={(value) => handleThemeChange('logoPosition', value)}
                    >
                      <Option value="left">Left</Option>
                      <Option value="center">Center</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Font Size">
                    <Select
                      value={theme.fontSize}
                      onChange={(value) => handleThemeChange('fontSize', value)}
                    >
                      <Option value="small">Small</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="large">Large</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Sidebar Style">
                    <Radio.Group
                      value={theme.sidebarStyle}
                      onChange={(e) => handleThemeChange('sidebarStyle', e.target.value)}
                    >
                      <Radio.Button value="light">Light</Radio.Button>
                      <Radio.Button value="dark">Dark</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Header Style">
                    <Radio.Group
                      value={theme.headerStyle}
                      onChange={(e) => handleThemeChange('headerStyle', e.target.value)}
                    >
                      <Radio.Button value="light">Light</Radio.Button>
                      <Radio.Button value="dark">Dark</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={`Border Radius: ${theme.borderRadius}px`}>
                <Slider
                  min={0}
                  max={20}
                  value={theme.borderRadius}
                  onChange={(value) => handleThemeChange('borderRadius', value)}
                  marks={{
                    0: '0px',
                    6: '6px',
                    12: '12px',
                    20: '20px',
                  }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Compact Mode">
                    <Switch
                      checked={theme.compactMode}
                      onChange={(checked) => handleThemeChange('compactMode', checked)}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Animations">
                    <Switch
                      checked={theme.animationsEnabled}
                      onChange={(checked) => handleThemeChange('animationsEnabled', checked)}
                      checkedChildren="On"
                      unCheckedChildren="Off"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card title="Custom CSS" size="small" style={{ marginTop: '16px' }}>
          <Form.Item
            label="Additional CSS"
            help="Add custom CSS to further customize the appearance"
          >
            <Input.TextArea
              rows={6}
              value={theme.customCss}
              onChange={(e) => handleThemeChange('customCss', e.target.value)}
              placeholder="/* Add your custom CSS here */
.custom-button {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}"
            />
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
}