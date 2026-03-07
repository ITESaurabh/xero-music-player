import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_AA } from '../config/constants';

const { ipcRenderer } = window.require('electron');

interface TrackData {
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  queueIndex: number;
  queueTotal: number;
  status: 'new-track' | 'playing' | 'paused';
}

const OverlayApp: React.FC = () => {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (_: Electron.IpcRendererEvent, data: TrackData) => {
      // First paint in hidden state, then transition in on the next two frames
      setTrack(data);
      setVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            setVisible(false);
            // After exit animation, tell main to hide the window
            setTimeout(() => ipcRenderer.send('hide-overlay'), 450);
          }, 3200);
        });
      });
    };

    ipcRenderer.on('show-overlay', handler);
    return () => {
      ipcRenderer.removeListener('show-overlay', handler);
    };
  }, []);

  const albumArtSrc = track?.albumArt
    ? `file:///${track.albumArt.replace(/\\/g, '/')}`
    : DEFAULT_AA;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(16, 14, 20, 0.9)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.85)',
          padding: '8px 14px 8px 8px',
          /* Slide-in from the right edge */
          transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 20px))',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}
      >
        {/* Album Art */}
        <img
          src={albumArtSrc}
          alt="album"
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        />

        {/* Track info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Badge row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 3,
            }}
          >
            {track && track.queueTotal > 0 && (
              <span
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: 10,
                  lineHeight: 1,
                }}
              >
                {track.queueIndex + 1} of {track.queueTotal}
              </span>
            )}
            <span
              style={{
                background:
                  track?.status === 'paused'
                    ? 'rgba(255,255,255,0.15)'
                    : track?.status === 'playing'
                      ? '#2e7d32'
                      : '#9c27b0',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {track?.status === 'paused'
                ? '⏸ Paused'
                : track?.status === 'playing'
                  ? '▶ Playing'
                  : 'Now Playing'}
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              lineHeight: 1.35,
              maxWidth: '200px',
            }}
          >
            {track?.title || '—'}
          </div>

          {/* Artist */}
          {track?.artist && (
            <div
              style={{
                color: 'rgba(255,255,255,0.58)',
                fontSize: 11,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
                maxWidth: '200px',
              }}
            >
              {track.artist}
            </div>
          )}

          {/* Album */}
          {track?.album && (
            <div
              style={{
                color: '#ce93d8',
                fontSize: 11,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
                maxWidth: '200px',
              }}
            >
              {track.album}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverlayApp;
