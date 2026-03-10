'use client';
import { useState, useRef, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { iaAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const SUGERENCIAS = [
  '¿Cuántas órdenes están atrasadas?',
  '¿Qué planta tiene más problemas?',
  '¿Cuál es el proveedor con más atrasos?',
  '¿Qué comprador tiene más órdenes atrasadas?',
  'Dame un resumen del estado actual',
  '¿Cuántas órdenes tienen contacto de proveedor?',
];

export default function IAChatPage() {
  return <AppShell><IAChatContent /></AppShell>;
}

function IAChatContent() {
  const toast   = useToast();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hola, soy el asistente de expeditación de GCC México. Tengo acceso a los datos del reporte cargado y puedo responder preguntas sobre órdenes, proveedores, plantas y compradores. ¿En qué puedo ayudarte?',
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function enviar(texto) {
    const msg = texto || input.trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const historial = newMessages
        .slice(1)
        .map(m => ({ role: m.role === 'ai' ? 'model' : 'user', content: m.content }));

      const { respuesta } = await iaAPI.chat(msg, historial.slice(-10));
      setMessages(m => [...m, { role: 'ai', content: respuesta }]);
    } catch (err) {
      setMessages(m => [...m, {
        role: 'ai',
        content: `Error: ${err.message}. Verifica que el backend esté corriendo.`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div>
      <AIHeader
        icon="⬡"
        title="ASISTENTE IA"
        sub="Consulta información del reporte en lenguaje natural"
      />

      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 500 }}>
        <div className="card-header">
          <span className="card-header-title">Chat con datos del reporte</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Gemini conectado</span>
          </div>
        </div>

        {/* Sugerencias */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          background: 'var(--navy-xlight)',
        }}>
          {SUGERENCIAS.map(s => (
            <button
              key={s}
              onClick={() => enviar(s)}
              disabled={loading}
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--navy)',
                padding: '4px 12px',
                borderRadius: 99,
                fontSize: '0.7rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--navy)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--navy)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.color = 'var(--navy)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mensajes */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'var(--bg)',
        }}>
          {messages.map((m, i) => (
            <div
              key={i}
              className="fade-up"
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '78%',
              }}
            >
              {m.role === 'ai' && (
                <div style={{
                  fontSize: '0.6rem',
                  color: 'var(--purple)',
                  fontWeight: 700,
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <span>✦</span> Asistente GCC
                </div>
              )}
              <div style={{
                padding: '10px 14px',
                borderRadius: m.role === 'user'
                  ? '12px 12px 3px 12px'
                  : '12px 12px 12px 3px',
                background: m.role === 'user' ? 'var(--navy)' : 'var(--surface)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                border: m.role === 'ai' ? '1.5px solid var(--border)' : 'none',
                fontSize: '0.83rem',
                lineHeight: 1.65,
                boxShadow: m.role === 'ai'
                  ? '0 1px 4px rgba(25,43,141,0.06)'
                  : '0 2px 8px rgba(25,43,141,0.2)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '78%' }}>
              <div style={{
                fontSize: '0.6rem',
                color: 'var(--purple)',
                fontWeight: 700,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                ✦ Asistente GCC
              </div>
              <div style={{
                padding: '12px 16px',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: '12px 12px 12px 3px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 7, height: 7,
                        borderRadius: '50%',
                        background: 'var(--purple)',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Consultando datos...
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 10,
          background: 'var(--surface)',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
            rows={1}
            className="input"
            style={{
              flex: 1,
              resize: 'none',
              padding: '10px 14px',
              lineHeight: 1.5,
              overflowY: 'hidden',
            }}
          />
          <button
            onClick={() => enviar()}
            disabled={loading || !input.trim()}
            className="btn btn-ai"
            style={{ padding: '10px 20px', alignSelf: 'flex-end' }}
          >
            <span>✦</span> Enviar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function AIHeader({ icon, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
      <div style={{
        width: 46, height: 46,
        background: 'var(--purple-light)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
        border: '1.5px solid rgba(124,58,237,0.2)',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', letterSpacing: 2, color: 'var(--navy)' }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{sub}</span>
          <span className="ai-badge">✦ Gemini AI</span>
        </div>
      </div>
    </div>
  );
}