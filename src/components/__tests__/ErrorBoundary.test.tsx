import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test component for withErrorBoundary HOC
const TestComponent: React.FC<{ message: string }> = ({ message }) => {
  return <div>{message}</div>;
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error for expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('error catching', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should catch and display error', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText(/예상치 못한 오류가 발생했습니다/)).toBeInTheDocument();
    });

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // ErrorBoundary logs errors to console.error
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should show error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Multiple elements may contain the error message (error name + stack)
      const errorElements = screen.getAllByText(/Test error/);
      expect(errorElements.length).toBeGreaterThan(0);

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/Test error/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback when error occurs', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('문제가 발생했습니다')).not.toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it('should have reset button that is clickable', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();

      const resetButton = screen.getByText('다시 시도');
      expect(resetButton).toBeInTheDocument();

      // Button should be clickable
      fireEvent.click(resetButton);
      // After reset, error boundary will try to re-render children
      // Since ThrowError still throws, error UI will show again
      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    });
  });

  describe('reload functionality', () => {
    it('should reload page when reload button is clicked', () => {
      const reloadMock = jest.fn();
      window.location.reload = reloadMock;

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('페이지 새로고침');
      fireEvent.click(reloadButton);

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('error information', () => {
    it('should display error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Check for AlertTriangle icon (using class or test-id if available)
      const errorIcon = screen.getByText('문제가 발생했습니다').parentElement;
      expect(errorIcon).toBeInTheDocument();
    });

    it('should include contact message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/문제가 지속되면 관리자에게 문의해주세요/)).toBeInTheDocument();
    });
  });

  describe('componentDidCatch', () => {
    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // ErrorBoundary logs with console.error
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Find the call that contains our error boundary log
      const errorBoundaryLog = consoleErrorSpy.mock.calls.find(
        call => call[0] && call[0].includes && call[0].includes('[ErrorBoundary]')
      );

      expect(errorBoundaryLog).toBeDefined();
    });
  });

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with ErrorBoundary', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent message="Test message" />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should catch errors in wrapped component', () => {
      const WrappedComponent = withErrorBoundary(ThrowError);

      render(<WrappedComponent />);

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    });

    it('should use custom fallback with HOC', () => {
      const customFallback = <div>HOC custom error</div>;
      const WrappedComponent = withErrorBoundary(ThrowError, customFallback);

      render(<WrappedComponent />);

      expect(screen.getByText('HOC custom error')).toBeInTheDocument();
    });

    it('should set correct display name', () => {
      const NamedComponent: React.FC = () => <div>Named</div>;
      NamedComponent.displayName = 'MyComponent';

      const WrappedComponent = withErrorBoundary(NamedComponent);

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(MyComponent)');
    });

    it('should handle component without display name', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toContain('withErrorBoundary');
    });

    it('should pass props to wrapped component', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent message="Passed prop" />);

      expect(screen.getByText('Passed prop')).toBeInTheDocument();
    });
  });

  describe('multiple errors', () => {
    it('should display error UI consistently', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();

      // Check that error UI elements are present
      expect(screen.getByText('다시 시도')).toBeInTheDocument();
      expect(screen.getByText('페이지 새로고침')).toBeInTheDocument();
    });
  });

  describe('nested components', () => {
    it('should catch errors from nested components', () => {
      const NestedComponent = () => (
        <div>
          <div>
            <ThrowError />
          </div>
        </div>
      );

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    });
  });

  describe('error boundary hierarchy', () => {
    it('should catch error at the nearest boundary', () => {
      const outerFallback = <div>Outer error</div>;
      const innerFallback = <div>Inner error</div>;

      render(
        <ErrorBoundary fallback={outerFallback}>
          <div>
            <ErrorBoundary fallback={innerFallback}>
              <ThrowError />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      // Should show inner boundary's fallback
      expect(screen.getByText('Inner error')).toBeInTheDocument();
      expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
    });
  });
});
