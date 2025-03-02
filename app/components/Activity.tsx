// components/Card.tsx
interface ActivityProps {
  id: string;
  image: string; // La imagen es obligatoria en la interfaz, pero puede ser una cadena vacía
  title: string;
  date: string;
  onClick: () => void; // Prop para manejar el clic
}

const Activity = ({ image, title, date, onClick }: ActivityProps) => {
  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick} // Manejar el clic en la Activity
    >
      {/* Contenedor de la imagen o fondo gris */}
      <div
        className="h-48 bg-cover bg-center"
        style={{
          backgroundImage: image ? `url(${image})` : "none", // Mostrar imagen si existe
          backgroundColor: image ? "transparent" : "#6b7280", // Fondo gris si no hay imagen
        }}
      ></div>

      {/* Contenido debajo de la imagen */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-800 truncate">{title}</h3>

        {/* Fecha */}
        <p className="text-sm text-gray-500 mt-2">{date}</p>
      </div>
    </div>
  );
};

export default Activity;