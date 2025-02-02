const Card = ({ image, title, date }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-sm">
      {/* Imagen en la parte superior */}
      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}></div>

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

export default Card;
