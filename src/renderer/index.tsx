import { createRoot } from 'react-dom/client';
import { JSX } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './css/Global.css';

// 主页面组件
function MainWindowView(): JSX.Element {
  const handleOpenPullTool = () => {
    window.electron?.ipcRenderer.sendMessage('close-main');
  };

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>编辑器救世主</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
        <button
          type="button"
          className="open-sync-tool"
          onClick={handleOpenPullTool}
        >
          <span role="img" aria-label="folder">
            📂
          </span>
          打开拉取工具
        </button>
      </div>
    </div>
  );
}

function MainWindow() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainWindowView />} />
      </Routes>
    </Router>
  );
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<MainWindow />);

// 调用 IPC
window.electron?.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron?.ipcRenderer.sendMessage('ipc-example', ['ping']);
