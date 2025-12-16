import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-900 text-white h-screen overflow-auto">
                    <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
                    <h2 className="text-2xl font-bold mb-2">Error:</h2>
                    <pre className="bg-black p-4 rounded mb-4 overflow-auto">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <h2 className="text-2xl font-bold mb-2">Stack Trace:</h2>
                    <pre className="bg-black p-4 rounded overflow-auto text-sm">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
