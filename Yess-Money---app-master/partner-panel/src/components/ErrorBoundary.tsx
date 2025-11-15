import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Здесь можно отправить ошибку в систему мониторинга
    // например, Sentry, LogRocket и т.д.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f4faf6 0%, #e3eed4 100%)',
          padding: 24,
        }}>
          <Result
            status="error"
            title="Произошла ошибка"
            subTitle="Извините, что-то пошло не так. Пожалуйста, попробуйте обновить страницу."
            extra={[
              <Button
                type="primary"
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
                style={{
                  background: 'linear-gradient(135deg, #37946e 0%, #69bb7b 100%)',
                  border: 'none',
                }}
              >
                Обновить страницу
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                marginTop: 24,
                padding: 16,
                background: '#fff',
                borderRadius: 8,
                maxWidth: 800,
                textAlign: 'left',
              }}>
                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>
                    Детали ошибки (только в режиме разработки)
                  </summary>
                  <pre style={{
                    marginTop: 8,
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    overflow: 'auto',
                    fontSize: 12,
                  }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

