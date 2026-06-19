import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export function LoginPage() {
  const { login } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [role, setRole] = useState<'operator' | 'admin'>('operator');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Informe nome, e-mail e telefone.');
      return;
    }
    await login({ name, email, phone, internalCode, role });
  }

  return (
    <div className="min-h-screen bg-field-50 px-4 py-8 text-field-900">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
        <section className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded bg-field-900 px-3 py-2 text-sm font-semibold text-white">
            <ShieldCheck className="h-4 w-4" />
            BLE Control Center
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">Controle BLE com rastreabilidade de uso.</h1>
          <p className="max-w-xl text-lg text-field-700">
            Identifique o utilizador para liberar conexao, comandos, sessoes, historico local e sincronizacao preparada para nuvem.
          </p>
        </section>

        <form onSubmit={onSubmit} className="rounded-md border border-field-100 bg-white p-5 shadow-panel">
          <h2 className="text-xl font-semibold">Identificacao do utilizador</h2>
          <div className="mt-5 grid gap-4">
            <label className="field-label">
              Nome
              <input className="field-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Operador" />
            </label>
            <label className="field-label">
              E-mail
              <input className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@empresa.com" />
            </label>
            <label className="field-label">
              Telefone
              <input className="field-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(00) 00000-0000" />
            </label>
            <label className="field-label">
              Codigo interno
              <input className="field-input" value={internalCode} onChange={(event) => setInternalCode(event.target.value)} placeholder="Opcional" />
            </label>
            <label className="field-label">
              Perfil
              <select className="field-input" value={role} onChange={(event) => setRole(event.target.value as 'operator' | 'admin')}>
                <option value="operator">Usuario comum</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
          </div>
          {error && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="primary-button mt-5 w-full" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
