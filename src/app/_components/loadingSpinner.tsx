// components/LoadingSpinner.tsx
const LoadingSpinner = () => {
    return (
      <div className="flex justify-center items-center">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left-color: #1d4ed8; /* Color azul */
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 8s linear infinite;
          }
  
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  };
  
  export default LoadingSpinner;
  