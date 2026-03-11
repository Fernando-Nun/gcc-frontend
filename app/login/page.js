'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { setSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await authAPI.login(email, password);
      setSession(token, user);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--navy-dark)' }}>

      {/* Panel izquierdo */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 100,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decoración */}
        <div style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,34,20,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          top: -60,
          left: -60,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480 }}>

          {/* Logo */}
          <div style={{ marginBottom: 40 }}>
            <Image
              src="/imagotipo-gcc.svg"
              alt="GCC México"
              width={300}
              height={120}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              priority
            />
          </div>

          <div style={{
            width: 70,
            height: 3,
            background: 'var(--red)',
            margin: '0 auto 32px',
          }} />

          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '2rem',
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 6,
            marginBottom: 18,
          }}>
            SISTEMA DE EXPEDITACIÓN
          </div>

          <div style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.8,
          }}>
            Gestión y seguimiento automatizado de órdenes de compra con inteligencia artificial
          </div>

          {/* Pills */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            marginTop: 40,
          }}>
            {['Fuzzy Matching', 'Correos Automáticos', 'IA ', 'Dashboard'].map(f => (
              <span key={f} style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                padding: '7px 18px',
                borderRadius: 99,
                fontSize: '0.8rem',
                letterSpacing: 1,
              }}>
                {f}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Panel derecho */}
      <div style={{
        width: 600,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '90px 70px',
      }}>
        <div style={{ width: '100%' }}>

          {/* Logo formulario */}
          <div style={{ marginBottom: 40 }}>
            <Image
              src="/imagotipo-gcc.svg"
              alt="GCC"
              width={95}
              height={95}
              style={{ objectFit: 'contain' }}
              priority
            />

            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '3rem',
              color: 'var(--navy)',
              letterSpacing: 5,
              marginTop: 18,
              marginBottom: 8,
            }}>
              ACCESO
            </div>

            <div style={{ fontSize: '1rem', color: 'var(--muted)' }}>
              Ingresa con tus credenciales corporativas
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--red-light)',
              border: '1px solid rgba(250,34,20,0.2)',
              color: 'var(--red)',
              padding: '14px 18px',
              borderRadius: 4,
              fontSize: '0.95rem',
              marginBottom: 24,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                color: 'var(--muted)',
                marginBottom: 8,
                fontWeight: 600,
              }}>
                Correo electrónico
              </label>

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@gcc.com.mx"
                required
                className="input"
                style={{ padding: '16px 18px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: 36 }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                color: 'var(--muted)',
                marginBottom: 8,
                fontWeight: 600,
              }}>
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
                style={{ padding: '16px 18px', fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-navy"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '18px 24px',
                fontSize: '1.1rem'
              }}
            >
              {loading
                ? <><span className="spinner" />INGRESANDO...</>
                : 'INGRESAR →'}
            </button>

          </form>

          <div style={{
            marginTop: 30,
            textAlign: 'center',
            fontSize: '0.95rem',
            color: 'var(--muted)',
          }}>
            ¿No tienes cuenta?{' '}
            <a href="/registro" style={{
              color: 'var(--navy)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Regístrate aquí
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}