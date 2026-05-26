'use client';

import { useState } from 'react';
import { FDI_TEETH, ALL_TEETH } from '@/lib/constants';
import { TOOTH_CONDITIONS, CONDITION_COLORS } from '@/lib/api';
import api from '@/lib/api';

interface ToothData {
  tooth_number: number;
  condition: string;
  diagnosis: string;
}

export default function DentalChart({
  patientId,
  chartData,
  onUpdate,
  readOnly = false,
}: {
  patientId: string;
  chartData: ToothData[];
  onUpdate: () => void;
  readOnly?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [condition, setCondition] = useState('karies');
  const [diagnosis, setDiagnosis] = useState('');
  const [saving, setSaving] = useState(false);

  const getTooth = (num: number) => chartData.find((t) => t.tooth_number === num);

  const handleToothClick = (num: number) => {
    if (readOnly) return;
    const existing = getTooth(num);
    setSelected(num);
    setCondition(existing?.condition || 'karies');
    setDiagnosis(existing?.diagnosis || '');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/dental-chart/${patientId}/${selected}`, { condition, diagnosis });
      onUpdate();
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const renderTooth = (num: number, flip = false) => {
    const data = getTooth(num);
    const color = data ? CONDITION_COLORS[data.condition] || '#94a3b8' : '#e2e8f0';
    const hasIssue = data && data.condition !== 'sog_lom';

    return (
      <button
        key={num}
        onClick={() => handleToothClick(num)}
        disabled={readOnly}
        className={`relative w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-2 transition-all hover:scale-110 ${
          selected === num ? 'ring-2 ring-dental-500 ring-offset-2' : ''
        } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        style={{
          backgroundColor: color,
          borderColor: hasIssue ? color : '#cbd5e1',
          transform: flip ? 'scaleY(-1)' : undefined,
        }}
        title={data?.diagnosis || `${num}-tish`}
      >
        <span
          className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white drop-shadow"
          style={{ transform: flip ? 'scaleY(-1)' : undefined }}
        >
          {num}
        </span>
      </button>
    );
  };

  const renderRow = (teeth: number[], flip = false) => (
    <div className="flex justify-center gap-1">
      {teeth.map((n) => renderTooth(n, flip))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto">
        <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Tish diagrammasi (FDI)</h3>
        <div className="min-w-[320px] space-y-6 py-4">
          <div>
            <p className="text-xs text-center text-gray-400 mb-2">Yuqori jag&apos;</p>
            {renderRow(FDI_TEETH.upperRight)}
            {renderRow(FDI_TEETH.upperLeft)}
          </div>
          <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
          <div>
            {renderRow(FDI_TEETH.lowerLeft, true)}
            {renderRow(FDI_TEETH.lowerRight, true)}
            <p className="text-xs text-center text-gray-400 mt-2">Pastki jag&apos;</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {Object.entries(TOOTH_CONDITIONS).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: CONDITION_COLORS[key] }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {selected && !readOnly && (
        <div className="card border-2 border-dental-200 dark:border-dental-800">
          <h4 className="font-semibold mb-3">{selected}-tish uchun diagnosis</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Holat</label>
              <select
                className="input-field mt-1"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {Object.entries(TOOTH_CONDITIONS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Diagnosis / Izoh</label>
              <input
                className="input-field mt-1"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Masalan: Chuqur karies"
              />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button className="btn-secondary" onClick={() => setSelected(null)}>Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
