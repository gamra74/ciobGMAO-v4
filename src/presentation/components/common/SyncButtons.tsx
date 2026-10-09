import { useState } from 'react';
import { UploadCloud, DownloadCloud, Loader2 } from 'lucide-react';

export default function SyncButtons({ state, onApplyRemoteState }) {
  const [loading, setLoading] = useState(false);

  const handleSaveToServer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmao/state', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state),
      });
      if (!response.ok) throw new Error('Failed to save');
      alert('تم الحفظ على الخادم بنجاح');
    } catch (err) {
      console.error(err);
      alert('فشل الحفظ على الخادم (قد تحتاج لتوكن مصادقة)');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromServer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmao/state');
      if (!response.ok) throw new Error('Failed to fetch');
      const { data } = await response.json();
      onApplyRemoteState(data);
      alert('تمت الاستعادة من الخادم بنجاح');
    } catch (err) {
      console.error(err);
      alert('فشل الاستعادة من الخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleSaveToServer}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
        <span>حفظ على الخادم</span>
      </button>
      <button 
        onClick={handleRestoreFromServer}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
        <span>استعادة من الخادم</span>
      </button>
    </div>
  );
}
