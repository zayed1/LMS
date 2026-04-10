'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, ChevronDown } from 'lucide-react';

interface Props {
  content: string;
}

// Split content into readable sentences while keeping line structure
function splitSentences(text: string): { id: number; text: string; isHeading?: boolean; isList?: boolean }[] {
  const lines = text.split('\n');
  const sentences: { id: number; text: string; isHeading?: boolean; isList?: boolean }[] = [];
  let id = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect headings
    if (trimmed.startsWith('# ')) {
      sentences.push({ id: id++, text: trimmed.slice(2), isHeading: true });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      sentences.push({ id: id++, text: trimmed.slice(3), isHeading: true });
      continue;
    }
    // Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      sentences.push({ id: id++, text: trimmed.slice(2), isList: true });
      continue;
    }
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      sentences.push({ id: id++, text: trimmed.replace(/^\d+[\.\)]\s/, ''), isList: true });
      continue;
    }
    // Split paragraph into sentences by Arabic and English punctuation
    const parts = trimmed.split(/(?<=[.!؟?])\s+/).filter(Boolean);
    for (const part of parts) {
      sentences.push({ id: id++, text: part });
    }
  }
  return sentences;
}

export function AudioReader({ content }: Props) {
  const sentences = splitSentences(content);
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentIdxRef = useRef<number>(-1);
  const userStoppedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      // Prefer Arabic voice
      const arabic = v.find(voice => voice.lang.startsWith('ar'));
      if (arabic) setSelectedVoice(arabic.name);
      else if (v[0]) setSelectedVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Stop reading when content changes (lesson change)
  useEffect(() => {
    stopReading();
  }, [content]);

  const speakSentence = (idx: number) => {
    if (idx < 0 || idx >= sentences.length) {
      stopReading();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(sentences[idx].text);
    utter.lang = 'ar-SA';
    utter.rate = rate;
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utter.voice = voice;

    utter.onend = () => {
      if (userStoppedRef.current) return;
      const next = currentIdxRef.current + 1;
      if (next < sentences.length) {
        currentIdxRef.current = next;
        setCurrentIdx(next);
        speakSentence(next);
      } else {
        stopReading();
      }
    };
    utter.onerror = () => {
      stopReading();
    };

    utteranceRef.current = utter;
    currentIdxRef.current = idx;
    setCurrentIdx(idx);
    setIsPlaying(true);
    userStoppedRef.current = false;
    window.speechSynthesis.speak(utter);
  };

  const playFromStart = () => {
    if (sentences.length === 0) return;
    speakSentence(0);
  };

  const togglePause = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      playFromStart();
    }
  };

  const stopReading = () => {
    userStoppedRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentIdx(-1);
    currentIdxRef.current = -1;
  };

  const handleSentenceClick = (idx: number) => {
    speakSentence(idx);
  };

  if (!supported) {
    return (
      <div className="max-w-none text-gray-700 leading-relaxed">
        {sentences.map(s => (
          <p key={s.id} className={s.isHeading ? "text-lg font-bold mt-4 mb-2" : "mb-2"}>{s.text}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Audio Controls */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2 sticky top-32 z-10 backdrop-blur">
        <button onClick={togglePause}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "إيقاف مؤقت" : "قراءة صوتية"}
        </button>

        {currentIdx >= 0 && (
          <button onClick={stopReading}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Square className="w-3.5 h-3.5" /> إيقاف
          </button>
        )}

        <div className="flex-1" />

        {currentIdx >= 0 && (
          <span className="text-xs text-primary font-medium">
            {currentIdx + 1} / {sentences.length}
          </span>
        )}

        {/* Settings */}
        <div className="relative">
          <button onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Volume2 className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSettings && (
            <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-20 w-56">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">السرعة: {rate}x</label>
                  <input type="range" min="0.5" max="2" step="0.25" value={rate}
                    onChange={e => setRate(Number(e.target.value))}
                    className="w-full accent-primary" />
                </div>
                {voices.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">الصوت</label>
                    <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-1 bg-white">
                      {voices.map(v => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="text-[10px] text-gray-400">
                  💡 اضغط على اي جملة للقراءة منها مباشرة
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Readable Content */}
      <div className="max-w-none text-gray-700 leading-relaxed">
        {sentences.map((s, idx) => {
          const isActive = currentIdx === idx;
          const baseCls = "cursor-pointer rounded px-1 transition-colors hover:bg-primary/5";
          const activeCls = isActive ? "bg-primary/15 border-r-4 border-primary" : "";

          if (s.isHeading) {
            return (
              <h3 key={s.id} onClick={() => handleSentenceClick(idx)}
                className={`text-lg font-bold text-gray-800 mt-4 mb-2 ${baseCls} ${activeCls}`}>
                {s.text}
              </h3>
            );
          }
          if (s.isList) {
            return (
              <li key={s.id} onClick={() => handleSentenceClick(idx)}
                className={`mr-4 mb-1 ${baseCls} ${activeCls}`}>
                {s.text}
              </li>
            );
          }
          return (
            <span key={s.id} onClick={() => handleSentenceClick(idx)}
              className={`inline ${baseCls} ${activeCls}`}>
              {s.text}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
