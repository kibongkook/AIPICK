'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Demo: 로컬스토리지에 저장 (Supabase 연동 시 API 호출로 교체)
    const subscribers = JSON.parse(localStorage.getItem('aipick_newsletter') || '[]');
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('aipick_newsletter', JSON.stringify(subscribers));
    }
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
        <p className="mt-2 text-sm font-semibold text-emerald-800">구독 완료!</p>
        <p className="mt-1 text-xs text-emerald-600">매주 새로운 AI 소식을 보내드릴게요.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-bold text-foreground">AI 뉴스레터 구독</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        매주 엄선된 AI 소식과 새로운 서비스 정보를 받아보세요.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          required
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          구독
        </button>
      </form>
    </div>
  );
}
