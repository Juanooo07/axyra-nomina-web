import { useTheme } from '../../contexts/ThemeContext';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 p-2 border-t border-slate-200">
      <button
        onClick={() => setTheme('light')}
        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
          theme === 'light'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
        title="Tema Claro"
      >
        ☀️ Claro
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
        title="Tema Oscuro"
      >
        🌙 Oscuro
      </button>
    </div>
  );
};
