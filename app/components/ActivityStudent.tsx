// components/ActivityStudent.tsx
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface ActivityStudentProps {
  id: string;
  image: string;
  title: string;
  date: string;
  onClick: () => void; // 👈 aseguramos que venga esta prop
}

const ActivityStudent: React.FC<ActivityStudentProps> = ({
  id,
  image,
  title,
  date,
  onClick,
}) => {
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const loadProtectedImage = async () => {
      if (!image) return;

      const token = Cookies.get("token");

      try {
        const response = await fetch(image, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Error cargando imagen protegida");
          return;
        }

        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        setPreviewImage(objectURL);
      } catch (err) {
        console.error("Error al cargar la imagen:", err);
      }
    };

    loadProtectedImage();
  }, [image]);

  return (
    <div
      onClick={onClick} // 👈 este es el click real
      className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-sm transition-shadow hover:shadow-lg cursor-pointer"
    >
      <div
        className="h-48 bg-cover bg-center"
        style={{
          backgroundImage: previewImage ? `url("${previewImage}")` : "none",
          backgroundColor: previewImage ? "transparent" : "#6b7280",
        }}
      ></div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 truncate">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{date}</p>
        <p className="text-sm text-primary-40 mt-2 font-medium">
          Explora tu curso
        </p>
      </div>
    </div>
  );
};

export default ActivityStudent;
