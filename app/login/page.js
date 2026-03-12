'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { setSession } from '@/lib/auth';
import './login.css';

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
    <div className="login-container">

      {/* Panel izquierdo */}
      <div className="left-panel">

        {/* Decoración */}
        <div className="circle-red" />
        <div className="circle-purple" />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480 }}>

          {/* Logo */}
          <div className="left-logo">
            <Image
              src="/imagotipo-gcc.svg"
              alt="GCC México"
              width={300}
              height={120}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              priority
            />
          </div>

          <div className="left-divider" />

          <div className="left-title">
            SISTEMA DE EXPEDITACIÓN
          </div>

          <div className="left-subtitle">
            Gestión y seguimiento automatizado de órdenes de compra con inteligencia artificial
          </div>

          {/* Pills */}
          <div className="pills">
            {['Fuzzy Matching', 'Correos Automáticos', 'IA', 'Dashboard'].map(f => (
              <span key={f} className="pill">{f}</span>
            ))}
          </div>

        </div>
      </div>

      {/* Panel derecho */}
      <div className="right-panel">
        <div style={{ width: '100%' }}>

          {/* Logo formulario */}
          <div className="form-header">
            <Image
              src="/imagotipo-gcc.svg"
              alt="GCC"
              width={95}
              height={95}
              style={{ objectFit: 'contain' }}
              priority
            />

            <div className="form-title">ACCESO</div>

            <div className="form-subtitle">
              Ingresa con tus credenciales corporativas
            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@gcc.com.mx"
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-navy submit-btn"
            >
              {loading
                ? <><span className="spinner" />INGRESANDO...</>
                : 'INGRESAR →'}
            </button>

          </form>

          <div className="register-text">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="register-link">
              Regístrate aquí
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
