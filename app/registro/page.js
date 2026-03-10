'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setSession } from '@/lib/auth';

export default function RegistroPage() {
  const router = useRouter();
  const [form,    setForm]    = useState({ nombre: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleRegistro(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await authAPI.registro(form.nombre, form.email, form.password);
      setSession(token, user);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--navy-dark)',
    }}>
      <div style={{
        background: '#fff',
        padding: '48px 44px',
        width: 440,
        borderRadius: 10,
        boxShadow: '0 24px 80px rgba(10,18,60,0.4)',
      }}>
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '2.2rem',
          color: 'var(--navy)',
          letterSpacing: 3,
          marginBottom: 4,
        }}>
          REGISTRO
        </div>
        <div style={{
          fontSize: '0.78rem',
          color: 'var(--muted)',
          marginBottom: 28,
        }}>
          Crea tu cuenta de acceso al sistema
        </div>

        {error && (
          <div style={{
            background: 'var(--red-light)',
            border: '1px solid rgba(250,34,20,0.2)',
            color: 'var(--red)',
            padding: '10px 14px',
            borderRadius: 4,
            fontSize: '0.8rem',
            marginBottom: 18,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro}>
          {[
            { key: 'nombre',   label: 'Nombre completo',    type: 'text',     placeholder: 'María García' },
            { key: 'email',    label: 'Correo electrónico', type: 'email',    placeholder: 'usuario@gcc.com.mx' },
            { key: 'password', label: 'Contraseña',         type: 'password', placeholder: 'Mínimo 6 caracteres' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block',
                fontSize: '0.63rem',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                color: 'var(--muted)',
                marginBottom: 6,
                fontWeight: 600,
              }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                required
                className="input"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-navy"
            style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '1rem', marginTop: 8 }}
          >
            {loading ? <><span className="spinner" />CREANDO CUENTA...</> : 'CREAR CUENTA →'}
          </button>
        </form>

        <div style={{
          marginTop: 22,
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--muted)',
        }}>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" style={{
            color: 'var(--navy)',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}