import { FaEdit } from 'react-icons/fa';

// Definir los tipos para las props
interface FloatingButtonProps {
  icon: React.ReactNode; // El ícono que se pasará como prop (puede ser cualquier cosa, como un componente de icono)
  onClick: () => void; // Función que se ejecutará cuando se haga clic en el botón
  color?: string; // Color del fondo del botón (opcional)
  size?: string; // Tamaño del padding (opcional)
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  onClick,
  color = 'bg-blue-500',
  size = 'p-4',
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 ${color} hover:bg-opacity-80 text-white ${size} rounded-full shadow-lg transition-all duration-300`}
    >
      {icon}
    </button>
  );
};

export default FloatingButton;
