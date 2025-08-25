import React, { useState, useRef, useEffect } from 'react';
import { Drawer } from 'antd';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import { useLocation } from 'react-router-dom';

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(450);
  const location = useLocation();
  // Vị trí icon chat
  const [pos, setPos] = useState({ left: 32, bottom: 32 });
  const dragRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const resizing = useRef(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Ẩn widget khi đang ở trang support
  if (location.pathname.startsWith('/support')) return null;

  // Xử lý drag
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.bottom,
      };
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    let left = e.clientX - 32 - offset.current.x;
    let bottom = winH - e.clientY - 32 - offset.current.y;
    left = Math.max(0, Math.min(left, winW - 64));
    bottom = Math.max(0, Math.min(bottom, winH - 64));
    setPos({ left, bottom });
  };
  // Xử lý resize
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizing.current = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (e: MouseEvent) => {
    if (!resizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    setDrawerWidth(Math.max(380, Math.min(newWidth, window.innerWidth - 100)));
  };

  const handleMouseUp = () => {
    dragging.current = false;
    resizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <div
        ref={dragRef}
        style={{
          position: 'fixed',
          left: pos.left,
          bottom: pos.bottom,
          zIndex: 9999,
          cursor: 'grab',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1677ff',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          color: '#fff',
          fontSize: 28,
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onClick={() => setOpen(o => !o)}
      >
        <span role="img" aria-label="chat">💬</span>
      </div>
      <Drawer
        open={open}
        onClose={() => { setOpen(false); setSelectedConv(null); }}
        width={drawerWidth}
        title="Hỗ trợ khách hàng"
        placement="right"
        styles={{
          body: { padding: 0 },
          header: {
            background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)', color: '#fff'
          }
        }}
      >
        <div style={{ position: 'relative', height: '100%' }}>
          {/* Thanh resize */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              cursor: 'col-resize',
              backgroundColor: 'transparent',
              zIndex: 1000,
            }}
            onMouseDown={handleResizeStart}
          />

          {!selectedConv ? (
            <ChatList onSelect={id => setSelectedConv(id)} width={drawerWidth - 32} />
          ) : (
            <ChatBox
              conversationId={selectedConv}
              onBack={() => setSelectedConv(null)}
              headerColor='linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)'
              width={drawerWidth - 32} // Trừ đi padding của Drawer
            />
          )}
        </div>
      </Drawer>
    </>
  );
};

export default ChatWidget; 