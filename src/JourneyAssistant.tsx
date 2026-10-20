import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, SendHorizontal } from 'lucide-react';
import Modal from './Modal';
import { parseAndRespondAI } from './data';
import type { AIResponse } from './data';
import { askRoutelyLocalModel } from './ollama';
import { shortStopName } from './journey';

interface Message extends AIResponse { role: 'user' | 'assistant' }

export default function JourneyAssistant({ from, to, onClose, onPlan }: {
  from: string; to: string; onClose: () => void; onPlan: (from: string, to: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: 'Tell me your starting area and destination, or ask about transfers. I use the same sample connections as the planner.' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [localAI, setLocalAI] = useState(false);
  const [notice, setNotice] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const requestInFlight = useRef(false);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [messages, busy]);
  async function send(query: string) {
    if (!query.trim() || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true); setInput(''); setNotice('');
    const history = messages.slice(1).map(({ role, text }) => ({ role, content: text }));
    setMessages((previous) => [...previous, { role: 'user', text: query }]);
    let response: AIResponse;
    if (localAI) {
      try { response = await askRoutelyLocalModel({ query, history, currentOriginId: from, currentDestinationId: to }); }
      catch { response = parseAndRespondAI(query, from, to); setLocalAI(false); setNotice('Local AI is unavailable. The built-in journey helper answered instead.'); }
    } else { response = parseAndRespondAI(query, from, to); }
    setMessages((previous) => [...previous, { role: 'assistant', ...response }]);
    setBusy(false); requestInFlight.current = false;
  }
  function submit(event: FormEvent) { event.preventDefault(); void send(input); }
  return <Modal title="Journey helper" onClose={onClose}>
    <p className="journey-muted">Optional help with the sample network. Planning a journey works without AI. Connections and boarding points still need field checking.</p>
    <div className="helper-messages" role="log" aria-label="Journey helper conversation" aria-live="polite">{messages.map((message, index) => <div className={'helper-message helper-' + message.role} key={index}><span>{message.role === 'user' ? 'You' : 'Routely'}</span><p>{message.text}</p>{message.route && message.origin && message.destination && <button className="journey-secondary" onClick={() => onPlan(message.origin!.id, message.destination!.id)}>Preview {shortStopName(message.origin)} → {shortStopName(message.destination)}<ArrowRight size={15} /></button>}</div>)}{busy && <p role="status">Thinking…</p>}<div ref={end} /></div>
    {notice && <p className="journey-note" role="status">{notice}</p>}
    <div className="helper-prompts">{['How do I get from Wuse 2 to Jabi?', 'Explain transfers for my route'].map((prompt) => <button key={prompt} onClick={() => void send(prompt)} disabled={busy}>{prompt}</button>)}</div>
    <form className="helper-input" onSubmit={submit}><label className="sr-only" htmlFor="helper-question">Ask about a journey</label><input id="helper-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a journey…" maxLength={1000} autoComplete="off" /><button type="submit" className="journey-primary" aria-label="Send question" disabled={busy || !input.trim()}><SendHorizontal size={18} /></button></form>
    <details className="helper-options"><summary>Optional local AI</summary><p className="journey-muted">Use a local model if Ollama is already set up on this computer. The built-in helper is available without it.</p><label><input type="checkbox" checked={localAI} disabled={busy} onChange={(event) => setLocalAI(event.target.checked)} /> Use local AI for replies</label></details>
  </Modal>;
}
