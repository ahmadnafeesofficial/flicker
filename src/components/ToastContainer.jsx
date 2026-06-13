
export default function ToastContainer({ toasts = [] }) {
  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-msg ${toast.out ? 'out' : ''}`}>
          <i className={`bi ${toast.icon}`}></i>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
