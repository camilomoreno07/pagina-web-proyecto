"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FaPen, FaEye, FaClone, FaSyncAlt } from "react-icons/fa";

interface ActivityProps {
  id: string;
  image: string; // URL protegida
  title: string;
  date: string;
  onClick: () => void; // ✏️ editar (wizard)
  onView?: () => void; // 👁️ feedback (opcional)
  onClone?: () => void; // 📋 clonar curso
  onRepeat?: () => void; // 🔁 reutilizar curso
}

const Activity = ({
  id,
  image,
  title,
  date,
  onClick,
  onView,
  onClone,
  onRepeat,
}: ActivityProps) => {
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const loadProtectedImage = async () => {
      if (!image) return;

      const token = Cookies.get("token");

      try {
        const response = await fetch(image, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        setPreviewImage(objectURL);

        return () => URL.revokeObjectURL(objectURL);
      } catch (err) {
        console.error("Error al cargar la imagen:", err);
      }
    };

    loadProtectedImage();
  }, [image]);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-sm">
      {/* Imagen */}
      <div
        className="h-48 bg-cover bg-center"
        style={{
          backgroundImage: previewImage ? `url(${previewImage})` : "none",
          backgroundColor: previewImage ? "transparent" : "#6b7280",
        }}
      ></div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 truncate">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-2">{date}</p>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-4">
          {/* ✏️ Editar → Wizard */}
          <button
            onClick={onClick}
            className="p-2 bg-primary-40 text-white rounded-full hover:bg-primary-30 transition"
            title="Editar curso"
          >
            <FaPen />
          </button>

          {/* 📋 Clonar → Duplica el curso */}
          {onClone && (
            <button
              onClick={onClone}
              className="p-2 bg-primary-40 text-white rounded-full hover:bg-primary-30 transition"
              title="Clonar curso"
            >
              <FaClone />
            </button>
          )}

          {/* 🔁 Reutilizar → Basado en curso existente */}
          {onRepeat && (
            <button
              onClick={onRepeat}
              className="p-2 bg-primary-40 text-white rounded-full hover:bg-primary-30 transition"
              title="Reutilizar curso"
            >
              <FaSyncAlt />
            </button>
          )}

          {/* 👁️ Ver → Feedback (solo si hay onView) */}
          {onView && (
            <button
              onClick={onView}
              className="p-2 bg-primary-40 text-white rounded-full hover:bg-primary-30 transition"
              title="Revisar curso"
            >
              <FaEye />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
