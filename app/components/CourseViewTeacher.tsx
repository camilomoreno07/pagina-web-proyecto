"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FaArrowLeft } from "react-icons/fa";
import CourseDetailsTeacher from "./CourseDetailsTeacher";
import ContentSectionTeacher from "./ContentSectionTeacher";

interface CourseViewStudentProps {
  course: Course;
  onClose: () => void;
}

const CourseViewStudent = ({ course, onClose }: CourseViewStudentProps) => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [bannerImage, setBannerImage] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      const loadedImages: Record<string, string> = {};

      if (course.imageUrl) {
        try {
          const response = await fetch(course.imageUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            setBannerImage(objectURL);
          }
        } catch (err) {
          console.error("Error al cargar imagen principal:", err);
        }
      }

      await Promise.all(
        course.contents?.map(async (content) => {
          if (content.imageUrl) {
            try {
              const res = await fetch(content.imageUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!res.ok) return;

              const blob = await res.blob();
              const objectURL = URL.createObjectURL(blob);
              loadedImages[content.imageUrl] = objectURL;
            } catch (err) {
              console.error("Error al cargar imagen de contenido:", err);
            }
          }
        }) || []
      );

      setImages(loadedImages);
    };

    loadImages();
  }, [course]);

  const handleSelectCard = (section: string) => {
    setSelectedCard(section);
  };

  const handleBackToDetails = () => {
    setSelectedCard(null);
  };

  return (
    <div>
      {/* Banner */}
      <div className="relative w-full-screen h-64 bg-gray-200">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt="Imagen del curso"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
            <p className="text-gray-500 font-medium">Sin imagen del curso</p>
          </div>
        )}
        <div className="absolute bottom-4 left-6">
          <h1 className="text-3xl font-semibold text-white drop-shadow-md">
            {course.courseName}
          </h1>
          <p className="text-sm text-gray-200">{course.period || "2025-1"}</p>
        </div>
      </div>

      {/* Contenido dinámico */}
      {selectedCard === null ? (
        <CourseDetailsTeacher
          courseId={course.courseId}
          course={course}
          images={images}
          onBack={onClose}
          onSelectCard={handleSelectCard}
        />
      ) : (
        <ContentSectionTeacher
          title={selectedCard}
          course={course}
          onBack={handleBackToDetails}
        />
      )}
    </div>
  );
};

export default CourseViewStudent;
