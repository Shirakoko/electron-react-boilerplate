import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/Global.css';

function SyncTool(): React.ReactElement {
  const handleClose = () => {
    window.close();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>拉取工具界面</h1>
      <p>这里是拉取工具的功能区域</p>
      <button type="button" onClick={handleClose}>
        关闭窗口
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<SyncTool />);
