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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--navy-dark)', flexDirection: 'column', padding: '0 20px' }}>

      {/* Panel izquierdo */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decoración */}
        <div style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: '45vw', // Cambiar a porcentaje para responsividad
          height: '45vw', // Cambiar a porcentaje para responsividad
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,34,20,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          top: -60,
          left: -60,
          width: '30vw', // Cambiar a porcentaje para responsividad
          height: '30vw', // Cambiar a porcentaje para responsividad
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '90%' }}>

          {/* Logo */}
          <div style={{ marginBottom: 20 }}>
            <Image
              src="/imagotipo-gcc.svg"
              alt="GCC México"
              width={250}
              height={100}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              priority
            />
          </div>

          <div style={{
            width: 70,
            height: 3,
            background: 'var(--red)',
            margin: '0 auto 20px',
          }} />

          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.5rem', // Tamaño de fuente reducido
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 3,
            marginBottom: 10,
          }}>
            SISTEMA DE EXPEDITACIÓN
          </div>

          <div style={{
            fontSize: '0.9rem', // Tamaño de fuente reducido
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.6,
          }}>
            Gestión y seguimiento automatizado de órdenes de compra con inteligencia artificial
          </div>

          {/* Pills */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            marginTop: 20,
          }}>
            {['Fuzzy Matching', 'Correos Automáticos', 'IA', 'Dashboard'].map(f => (
              <span key={f} style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                padding: '5px 12px', // Reducir padding
                borderRadius: 99,
                fontSize: '0.7rem', // Tamaño de fuente reducido
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
        width: '100%', // Ajustar a 100% para responsividad
        maxWidth: 600,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px', // Reducir padding
      }}>
        <div style={{ width: '100%' }}>

          {/* Logo formulario */}
          <div style={{ marginBottom: 20 }}>
            <Image
              src="/imagotipo-gcc.svg"
              alt="GCC"
              width={80} // Reducir tamaño del logo
              height={80} // Reducir tamaño del logo
              style={{ objectFit: 'contain' }}
              priority
            />

            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '2.5rem', // Tamaño de fuente reducido
              color: 'var(--navy)',
              letterSpacing: 5,
              marginTop: 10,
              marginBottom: 4,
            }}>
              ACCESO
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              Ingresa con tus credenciales corporativas
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--red-light)',
              border: '1px solid rgba(250,34,20,0.2)',
              color: 'var(--red)',
              padding: '10px 14px', // Reducir padding
              borderRadius: 4,
              fontSize: '0.85rem', // Tamaño de fuente reducido
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: '0.65rem', // Tamaño de fuente reducido
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                color: 'var(--muted)',
                marginBottom: 6,
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
                style={{ padding: '12px 14px', fontSize: '0.9rem', width: '100%' }} // Ajustar ancho
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: '0.65rem', // Tamaño de fuente reducido
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                color: 'var(--muted)',
                marginBottom: 6,
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
                style={{ padding: '12px 14px', fontSize: '0.9rem', width: '100%' }} // Ajustar ancho
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-navy"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '16px 20px', // Reducir padding
                fontSize: '1rem' // Tamaño de fuente reducido
              }}
            >
              {loading
                ? <><span className="spinner" />INGRESANDO...</>
                : 'INGRESAR →'}
            </button>

          </form>

          <div style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: '0.85rem', // Tamaño de fuente reducido
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