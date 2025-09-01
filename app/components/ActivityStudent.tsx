// components/ActivityStudent.tsx
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

const token = Cookies.get("token");
let username: string | null = null;
if (token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    username = payload.sub;
  } catch (err) {
    console.error("Error decoding token:", err);
  }
}

interface ActivityStudentProps {
  id: string; // courseId
  image: string;
  title: string;
  date: string;
  onClick: () => void;
}

const ActivityStudent: React.FC<ActivityStudentProps> = ({
  id,
  image,
  title,
  date,
  onClick,
}) => {
  const [previewImage, setPreviewImage] = useState<string>("");
  const [progress, setProgress] = useState<number | null>(null);

  /** ===== Load Protected Image ===== */
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

  /** ===== Load Progress ===== */
  useEffect(() => {
    const fetchProgress = async () => {
      if (!username) return;

      try {
        const res = await fetch(
          `http://localhost:8081/api/progress/course/${id}/student/${username}/percentage`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Error fetching progress");
          return;
        }

        const data = await res.json();
        setProgress(data * 100); // response is a double
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    fetchProgress();
  }, [id]);

  return (
    <div
      onClick={onClick}
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
        <hr className="border-t border-gray-200 mt-2 mb-2" />
        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{progress !== null ? `${progress.toFixed(0)}%` : "0%"}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-40 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress ?? 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStudent;
